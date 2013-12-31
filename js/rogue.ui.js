
/// <reference path="bootstrap.min.js" />
/// <reference path="jquery-1.10.2.min.js" />
/// <reference path="rogue.js" />


var Rogue;

(function ($, Rogue) {
    'use strict';


    String.prototype.format = function (data) {
        return this.replace(/{(\w+)}/g, function (match) {
            if (match.length <= 2) return match;
            var p = match.replace(/^{/, '').replace(/}$/, '')
            return typeof data[p] != 'undefined' ? data[p] : match;
        });
    };


    var $saveEditorContainer;
    var $sectionContainer;
    var $tabbedContainer;
    var originalFilename = '';

    function setValue(name, value) {
        $saveEditorContainer.find('#' + name).val(parseFloat(value));
    }



    function startSection(title, description) {
        var $html = $($('#templatePanel').html()
                    .format({ title: title, description: (description || '') }));

        $sectionContainer = $html.find('.panel-body');

        $saveEditorContainer.append($html);
    }

    function endSection() {
        $sectionContainer = null;
    }

    function startTabbedSection(containerId, tabData) {

        var tabPanel = '<ul class="nav nav-tabs">';
        var contentsPanel = '<div class="tab-content" id="' + containerId + '">';

        for (var i in tabData) {
            var item = tabData[i];
            item.active = (i == 0 ? 'active' : '');
            tabPanel += '<li class="{active}"><a href="#{tabName}" data-toggle="tab">{name}</a></li>'.format(item);

            contentsPanel += '<div class="tab-pane {active}" id="{tabName}"></div>'.format(item);
        }

        tabPanel += '</ul>';
        contentsPanel += '</div>';

        var $target = $sectionContainer || $saveEditorContainer;

        $target.append($(tabPanel));
        $tabbedContainer = $(contentsPanel);
        $target.append($tabbedContainer);


    }

    function endTabbedSection() {
        $tabbedContainer = null;
    }


    function addTemplatedItem(data) {

        data.value = Rogue.processedObject[data.prop];

        if (data.propIndex) {
            data.value = data.value[data.propIndex];
        }
        else
            data.propIndex = 'undefined';

        if (typeof (data.value) === 'boolean') {
            data.checked = data.value ? 'checked' : '';
        }

        if (data.template == 'Select') {

            var opts = '';
            for (var i in data.options) {
                opts += '<option value="' + i + '"' + (data.value == i ? 'selected' : '') + '>' + data.options[i] + '</option>';
            }
            data.options = opts;
        }

        data.min = data.min || 0;
        data.offLabel = data.offLabel || 'No';
        data.onLabel = data.onLabel || 'Yes';
        data.onClass = data.onClass || 'primary';
        data.offClass = data.offClass || 'default';
        data.readOnly = data.readOnly ? 'readonly' : '';



        data.help = data.help || '';


        if (data.template == 'Int') {
            data.max = data.max || Rogue.MAX_INT32;
            data.numberType = 'whole';
        }
        else if (data.template == 'Byte') {
            data.max = data.max || Rogue.MAX_BYTE;
            data.template = 'Int';
            data.numberType = 'whole';
        }
        else if (data.template == 'Float') {
            data.max = data.max || Rogue.MAX_FLOAT;
            data.template = 'Int';
            data.step = 'any';
            data.numberType = 'float';
        }
        else
            data.max = data.max || 0;

        data.step = data.step || Math.min(1000, Math.round(data.max * .10));



        var $html = $($('#template' + data.template).html().format(data));

        if (data.template === 'Bool') {
            //wire up
            $html.find('input[type=checkbox]').bootstrapSwitch();
        }

        if ($tabbedContainer && data.tabName)
            $tabbedContainer.find('#' + data.tabName).append($html);
        else if ($sectionContainer)
            $sectionContainer.append($html);
        else
            $saveEditorContainer.append($html);


    }


    function createUpgradeUI() {
        $saveEditorContainer.empty();

        // used for building the blueprints and runes grids
        var createEquipmentGrid = function (prop, options) {

            var equimentCategoriesTabs = [];

            for (var i in Rogue.equipmentCategories) {
                var name = Rogue.equipmentCategories[i];
                equimentCategoriesTabs.push({ name: name, tabName: encodeURI(prop + '-' + name) });
            }

            var containerId = prop + 'GridContainer';
            startTabbedSection(containerId, equimentCategoriesTabs);

            var cellTemplate = $('#templateEquipmentCell').html();

            for (var ti in equimentCategoriesTabs) {
                var tab = equimentCategoriesTabs[ti];

                var cellsHtml = '';
                var col = 0;

                var flush = function () {

                    addTemplatedItem({
                        cells: cellsHtml,
                        template: 'EquipmentRow',
                        tabName: tab.tabName
                    });
                    col = 0;
                    cellsHtml = '';
                };


                for (var i in options) {
                    var name = options[i];

                    cellsHtml += cellTemplate.format({
                        name: name,
                        prop: prop,
                        toggled: (Rogue.equipmentFound(prop, ti, i) ? 'data-toggled' : ''),
                        propIndex: ti + ',' + i,
                        untoggledValue: 0,
                        toggledValue: 3
                    });


                    if (++col >= 5)
                        flush();
                }

                if (cellsHtml.length > 0)
                    flush();
            }


            endTabbedSection();

            var $buttonTemplate = $($('#templateEquipmentButtonGroup').html());

            $buttonTemplate.find('button').click(function (evt) {
                evt.stopPropagation();
                evt.preventDefault();

                var $elems = $('#' + containerId + ' .equipment-cell');

                if ($(this).data('role') == 'lock')
                    $elems.removeAttr('data-toggled');
                else
                    $elems.attr('data-toggled', '');

            });

            $sectionContainer.append($buttonTemplate);

        }


        startSection('Equipment Blueprints');

        createEquipmentGrid('blueprints', Rogue.equipmentBaseTypes)

        endSection();


        startSection('Runes');

        createEquipmentGrid('runes', Rogue.runeTypes)

        endSection();


        startSection('Skills', 'The manor');

        for (var i in Rogue.skills) {
            var skill = Rogue.skills[i];
            addTemplatedItem({ template: 'Int', prop: 'skills', propIndex: i, title: skill.name, min: 0, max: skill.max });
        }

        endSection();



        $('#editor').show();
        $('#uploadContainer').hide();
    }




    function createCharacterUI() {
        $saveEditorContainer.empty();


        startSection('Your Current Character', 'The following values affect the character you are currently playing.');

        addTemplatedItem({ template: 'String', prop: 'playerName', title: 'Name' });
        addTemplatedItem({ template: 'Select', prop: 'classType', title: 'Class', options: Rogue.classes });
        addTemplatedItem({ template: 'Select', prop: 'traitsA', title: 'Trait A', options: Rogue.traits });
        addTemplatedItem({ template: 'Select', prop: 'traitsB', title: 'Trait B', options: Rogue.traits });
        addTemplatedItem({ template: 'Select', prop: 'spell', title: 'Spell', options: Rogue.spells });
        addTemplatedItem({ template: 'Select', prop: 'specialItem', title: 'Special Item', options: Rogue.specialItems });
        addTemplatedItem({ template: 'Int', prop: 'currentHealth', title: 'Current Health', help: 'The game will reset this value to the max possible for your character on load' });
        addTemplatedItem({ template: 'Int', prop: 'currentMana', title: 'Current Mana', help: 'The game will reset this value to the max possible for your character on load' });
        addTemplatedItem({ template: 'Bool', prop: 'isDead', title: 'You are dead', onClass: 'danger', offClass: 'success' });
        addTemplatedItem({ template: 'Bool', prop: 'isFemale', title: 'Gender', onClass: 'default', offClass: 'default', onLabel: 'Lady', offLabel: 'Sir' });
        addTemplatedItem({ template: 'Bool', prop: 'lockCastle', title: 'Castle Locked' });

        var boss = { template: 'Bool', onLabel: 'Dead', offLabel: 'Alive', onClass: 'danger', offClass: 'success' };
        addTemplatedItem($.extend({ prop: 'eyeballBossBeaten', title: 'Khidr' }, boss));
        addTemplatedItem($.extend({ prop: 'fairyBossBeaten', title: 'Alexander' }, boss));
        addTemplatedItem($.extend({ prop: 'fireballBossBeaten', title: 'Ponce de Leon' }, boss));
        addTemplatedItem($.extend({ prop: 'blobBossBeaten', title: 'Herodotus' }, boss));
        addTemplatedItem($.extend({ prop: 'lastbossBeaten', title: 'Johannes' }, boss));
        addTemplatedItem($.extend({ prop: 'newBossBeaten', title: 'New Boss(?)' }, boss));

        endSection();

        startSection('Your Profile', 'These values affect your entire profile');

        addTemplatedItem({ template: 'Int', prop: 'gold', title: 'Gold' });

        var bonus = { template: 'Int', min: 0, max: 500, help: 'Technically, you can go higher with this value, but it might cause a negative effect' }
        addTemplatedItem($.extend({ prop: 'bonusHealth', title: 'Bonus Health' }, bonus));
        addTemplatedItem($.extend({ prop: 'bonusStrength', title: 'Bonus Stength' }, bonus));
        addTemplatedItem($.extend({ prop: 'bonusMana', title: 'Bonus Mana' }, bonus));
        addTemplatedItem($.extend({ prop: 'bonusDefense', title: 'Bonus Defense' }, bonus));
        addTemplatedItem($.extend({ prop: 'bonusWeight', title: 'Bonus Weight' }, bonus));
        addTemplatedItem($.extend({ prop: 'bonusMagic', title: 'Bonus Magic' }, bonus));

        addTemplatedItem({ template: 'Bool', prop: 'hardcoreMode', title: 'Hardcore Mode' });
        addTemplatedItem({ template: 'Bool', prop: 'spokenToLastBoss', title: 'Spoke To Last Boss' });
        addTemplatedItem({ template: 'Bool', prop: 'readLastDiary', title: 'Read Last Diary' });

        addTemplatedItem({ template: 'Int', prop: 'timesDead', title: 'Times Died' });
        addTemplatedItem({ template: 'Int', prop: 'timesCastleBeaten', title: 'Times Castle Beaten' });
        addTemplatedItem({ template: 'Float', prop: 'totalHoursPlayed', title: 'Total Hours Played', max: 2000, help: 'Max is technically ' + Rogue.MAX_FLOAT + ' but let\'s be realistic' });

        endSection();

        $('#editor').show();
        $('#uploadContainer').hide();
    }


    function buildObjectFromUI() {
        var ret = {};

        $saveEditorContainer.find('select, input, [data-toggle-box]').each(function (e, t) {

            var propName = t.name || t.attributes['data-prop'].value;
            var val;

            if (t.type === 'text') {
                val = $.trim(t.value);
            }
            else if (t.type === 'number') {
                if (t.attributes['data-number-type'] && t.attributes['data-number-type'].value === 'float') {
                    val = parseFloat(t.value);
                }
                else {
                    val = parseInt(t.value);
                }
            }
            else if (t.type === 'checkbox') {
                val = t.checked;
            }
            else if (t.type === 'select-one') {
                val = t.value;
            }
            else if (t.hasAttribute('data-toggle-box')) {
                if (t.attributes['data-toggled'])
                    val = t.attributes['data-toggled-value'].value;
                else
                    val = t.attributes['data-untoggled-value'].value;
            }


            var set = false;

            if (t.hasAttribute('data-propIndex')) {
                var indexes = t.attributes['data-propindex'].value;

                if (indexes != 'undefined') {

                    indexes = indexes.split(',');

                    var prop = ret[propName];
                    var arr = addToArray(prop, indexes, val)

                    ret[propName] = arr;
                    set = true;
                }

            }

            if (!set) {
                ret[propName] = val;
            }


        });

        return ret;
    }

    function addToArray(source, indexes, value) {
        if (!source)
            source = [];

        if (indexes.length > 1) {
            var newSource = (source[indexes[0]] || []);
            var ret = addToArray(newSource, indexes.slice(0).splice(1), value);
            source[indexes[0]] = ret;
        }
        else {
            source[indexes[0]] = value;
        }
        return source;
    }


    function saveProfile() {
        var newObject = buildObjectFromUI();
        Rogue.commitChanges(newObject);
        Rogue.downloadFile(originalFilename);

    }

    function showAlert(msg) {
        var $alert = $('#alert');
        $alert.find('.alert-message').text(msg);
        $alert.alert();
        $alert.show();
    }

    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var file = evt.dataTransfer.files[0];

        originalFilename = file.name;

        var reader = new FileReader();

        reader.onloadend = function (evt) {

            try {

                Rogue.readData(reader.result, originalFilename);

            } catch (e) {
                showAlert(e);
            }

            switch (Rogue.currentSchemaName) {
                case 'Player':
                    createCharacterUI();
                    break;

                case 'Upgrade':
                    createUpgradeUI();
                    break;

            }


        }

        reader.readAsArrayBuffer(file);


    }

    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
    }

    function init() {
        $saveEditorContainer = $('#saveEditorForm');

        $('#downloadButton').click(saveProfile);

        $('#resetButton').click(function () {
            $('#editor').hide();
            $('#uploadContainer').show();
        });


        $saveEditorContainer.on('click', '[data-toggle-box]', function () {
            var $t = $(this);
            if ($t.attr('data-toggled') !== undefined)
                $t.removeAttr('data-toggled');
            else
                $t.attr('data-toggled', '');

        })

        var dropZone = document.getElementById('uploadContainer');
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);
    }




    Rogue.UI = {
        init: init,
        setValue: setValue,
        showAlert: showAlert,
        _build: buildObjectFromUI

    };

})(jQuery, (Rogue || (Rogue = {})));
