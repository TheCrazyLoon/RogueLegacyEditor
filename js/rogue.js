
/// <reference path="bootstrap.min.js" />
/// <reference path="jquery-1.10.2.min.js" />
/// <reference path="FileSaver.js" />
/// <reference path="jdataview.js" />


/* extensions for jDataView */
(function (jDataView) {
    'use strict';

    /**
    * Reads a 7-bit integer from the view
    *
    * @param {jDataView} view The DataView to read from
    * @return {number}
    */
    function read7BitInt(view) {
        var n1 = 0;
        var n2 = 0;
        while (n2 != 35) {
            var b = view.getBytes(1)[0];
            n1 |= (b & 127) << n2;
            n2 += 7;
            if ((b & 128) == 0)
                return n1;
        }
    }

    /**
    * Writes a 7-bit integer to the view
    *
    * @param {jDataView} view The DataView to write to
    * @param {numbe} value The integer to write
    */
    function write7BitInt(view, value) {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="view"></param>
        /// <param name="value"></param>
        for (var n = value; n >= 128; n >>= 7) {
            view.writeInt8(n | 128);
        }
        view.writeInt8(n);
    }

    /**
    * Reads a string whose length is preceding as a 7-bit integer
    *
    * @return {string}
    */
    jDataView.prototype.readString = function () {
        var length = read7BitInt(this);
        return this.getString(length);
    }

    /**
    * Writes a string whose length is preceding as a 7-bit integer
    *
    * @param {string} value The string to write
    */
    jDataView.prototype.writeString = function (value) {
        write7BitInt(this, value.length);
        this.setString(this._offset, value);
    }

    jDataView.prototype.readBool = function () {
        return (this.getInt8() == 1);
    }

    jDataView.prototype.writeBool = function (value) {
        this.setInt8(this._offset, value ? 1 : 0);
    }

    jDataView.prototype.readInt32 = function (value) {
        return this.getInt32(this._offset, value);
    }

    jDataView.prototype.writeInt32 = function (value) {
        this.setInt32(this._offset, value);
    }

    jDataView.prototype.readByte = function (value) {
        return parseInt(this.getUint8(this._offset, value));
    }

    jDataView.prototype.writeByte = function (value) {
        this.setUint8(this._offset, value);
    }

    jDataView.prototype.readSByte = function (value) {
        return parseInt(this.getInt8(this._offset, value));
    }

    jDataView.prototype.writeSByte = function (value) {
        this.setInt8(this._offset, value);
    }


    jDataView.prototype.readFloat32 = function (value) {
        return this.getFloat32(this._offset, value);
    }

    jDataView.prototype.writeFloat32 = function (value) {
        this.setFloat32(this._offset, value);
    }

    jDataView.prototype.readByteField = function (length) {
        var ret = [];
        for (var i = 0; i < length; i++) {
            ret.push(this.readByte());
        }

        return ret;
    }

    jDataView.prototype.writeByteField = function (value) {
        for (var i in value)
            this.writeByte(value[i]);
    }


    jDataView.prototype.readSByteField = function (length) {
        var ret = [];
        for (var i = 0; i < length; i++) {
            ret.push(this.readSByte());
        }

        return ret;
    }

    jDataView.prototype.writeSByteField = function (value) {
        for (var i in value)
            this.writeSByte(value[i]);
    }



    jDataView.prototype.readInt32Field = function (length) {
        var ret = [];
        for (var i = 0; i < length; i++) {
            ret.push(this.readInt32());
        }

        return ret;
    }

    jDataView.prototype.writeInt32Field = function (value) {
        for (var i in value)
            this.writeInt32(value[i]);
    }



    jDataView.prototype.readArrayOfByteFields = function (arrayLength, fieldLength) {
        var ret = [];
        for (var al = 0; al < arrayLength; al++) {
            var arr = this.readByteField(fieldLength);
            ret.push(arr);
        }

        return ret;
    }

    jDataView.prototype.writeArrayOfByteFields = function (value) {
        for (var al in value) {
            var arr = value[al];
            this.writeByteField(arr);
        }

    }

    
})(jDataView);


var Rogue;

(function (jDataView, Rogue) {
    'use strict';

    Rogue.MAX_INT32 = 2147483647;
    Rogue.MAX_BYTE = 255;
    Rogue.MAX_FLOAT = 3.40282347E+38;

    Rogue.specialItems = {
        0: 'None',
        1: 'Charon\'s Obol',
        2: 'Hedgehog\'s Curse',
        3: 'Hyperion\'s Ring',
        4: 'Hermes\' Boots',
        5: 'Helios\' Blessing',
        6: 'Calypso\'s Compass',
        8: 'Nerdy Glasses',
        9: 'Khidr\'s Obol',
        10: 'Alexander\'s Obol',
        11: 'Ponce De Leon\'s Obol',
        12: 'Herodotus\' Obol',
        13: 'Traitor\'s Obol'
    };
    Rogue.spells = {
        0: 'None',
        1: 'Dagger',
        2: 'Axe',
        3: 'Bomb',
        4: 'Time Stop',
        5: 'Crow Storm',
        6: 'Quantum Translocator',
        7: 'Displacer',
        8: 'Chakram',
        9: 'Scythe',
        10: 'Blade Wall',
        11: 'Flame Barrier',
        12: 'Conflux',
        13: 'Dragon Fire A',
        15: 'Dragon Fire B',
        14: 'Rapid Dagger',
        100: 'B.E.A.M'
    };
    Rogue.classes = {
        0: 'Knight',
        1: 'Mage',
        2: 'Barbarian',
        3: 'Knave',
        4: 'Shinobi',
        5: 'Miner',
        6: 'Spellthief',
        7: 'Lich',
        8: 'Paladin',
        9: 'Archmage',
        10: 'Barbarian King / Queen',
        11: 'Assassin',
        12: 'Hokage',
        13: 'Spelunker / Spelunkette',
        14: 'Spellsword',
        15: 'Lich King / Queen',
        16: 'Dragon',
        17: 'Traitor'
    };
    Rogue.traits = {
        0: 'None',
        1: 'Color Blind',
        2: 'Gay',
        3: 'Near-Sighted',
        4: 'Far-Sighted',
        5: 'Dyslexia',
        6: 'Gigantism',
        7: 'Dwarfism',
        8: 'Baldness',
        9: 'Endomorph',
        10: 'Ectomorph',
        11: 'Alzheimers',
        12: 'Dextrocardia',
        13: 'Coprolalia',
        14: 'ADHD',
        15: 'O.C.D.',
        16: 'Hypergonadism',
        17: 'Muscle Wk.',
        18: 'Stereo Blind',
        19: 'I.B.S.',
        20: 'Vertigo',
        21: 'Tunnel Vision',
        22: 'Ambilevous',
        23: 'P.A.D.',
        24: 'Alektorophobia',
        25: 'Hypochondriac',
        26: 'Dementia',
        27: 'Flexible',
        28: 'Eid. Mem.',
        29: 'Nostalgic',
        30: 'C.I.P.',
        31: 'Savant',
        32: 'The One',
        33: 'Clumsy',
        34: 'EHS',
        35: 'Glaucoma'
    };

    Rogue.equipmentStatus = {
        0: 'None',
        1: 'FoundNew',
        2: 'FoundKnown',
        3: 'Purchased'
    }

    
    Rogue.equipmentBaseTypes = {
        0: 'Squire',
        1: 'Silver',
        2: 'Guardian',
        3: 'Imperial',
        4: 'Royal',
        5: 'Knight',
        6: 'Ranger',
        7: 'Sky',
        8: 'Dragon',
        9: 'Slayer',
        10: 'Blood',
        11: 'Sage',
        12: 'Retribution',
        13: 'Holy',
        14: 'Dark'
    };

    Rogue.equipmentCategories = {
        0: 'Sword',
        1: 'Helm',
        2: 'Chestplate',
        3: 'Bracers',
        4: 'Cape'
    };

    Rogue.skills = {
        0: { name: 'Health Up', max: 75 },
        1: { name: 'Invuln Time Up', max: 5 },
        2: { name: 'Death Defy', max: 10 },
        3: { name: 'Attack Up', max: 75 },
        4: { name: 'Down Strike Up', max: 5 },
        5: { name: 'Crit Chance Up', max: 25 },
        6: { name: 'Crit Damage Up', max: 25 },
        7: { name: 'Magic Damage Up', max: 75 },
        8: { name: 'Mana Up', max: 75 },
        9: { name: 'Mana Cost Down', max: 5 },
        10: { name: 'Smithy', max: 1 },
        11: { name: 'Enchantress', max: 1 },
        12: { name: 'Architect', max: 1 },
        13: { name: 'Equip Up', max: 50 },
        14: { name: 'Armor Up', max: 50 },
        15: { name: 'Gold Gain Up', max: 5 },
        16: { name: 'Haggle', max: 5 },
        17: { name: 'Potion Up', max: 5 },
        18: { name: 'Randomize Children', max: 1 },
        19: { name: 'Unlock Lich', max: 1 },
        20: { name: 'Unlock Miner', max: 1 },
        21: { name: 'Unlock Spell Thief', max: 1 },
        22: { name: 'Unlock Shinobi', max: 1 },
        23: { name: 'Upgrade Knight', max: 1 },
        24: { name: 'Upgrade Mage', max: 1 },
        25: { name: 'Upgrade Knave', max: 1 },
        26: { name: 'Upgrade Miner', max: 1 },
        27: { name: 'Upgrade Barbarian', max: 1 },
        28: { name: 'Upgrade Lich', max: 1 },
        29: { name: 'Upgrade Shinobi', max: 1 },
        30: { name: 'Upgrade Spell Thief', max: 1 },
        31: { name: 'Beastiality', max: 1 }
    }

    Rogue.runeTypes = {
        0: 'Vault',
        1: 'Sprint',
        2: 'Vampire',
        3: 'Sky',
        4: 'Siphon',
        5: 'Retaliation',
        6: 'Bounty',
        7: 'Haste',
        8: 'Curse',
        9: 'Grace',
        10: 'Balance'
    };


    var propertyTypes = {
        1: 'Int32',
        2: 'Byte',
        3: 'Bool',
        4: 'String',
        5: 'Float32',
        6: 'ArrayOfByteFields',
        7: 'ByteField',
        8: 'SByteField',
        9: 'Int32Field'
    }

    var playerSchema = {
        name: "Player",
        items: [
            ['gold', 1],
            ['currentHealth', 1],
            ['currentMana', 1],
            ['age', 2],
            ['childAge', 2],
            ['spell', 2],
            ['classType', 2],
            ['specialItem', 2],
            ['traitsA', 2],
            ['traitsB', 2],
            ['playerName', 4],
            ['headPiece', 2],
            ['shoulderPiece', 2],
            ['chestPiece', 2],
            ['diaryEntry', 2],
            ['bonusHealth', 1],
            ['bonusStrength', 1],
            ['bonusMana', 1],
            ['bonusDefense', 1],
            ['bonusWeight', 1],
            ['bonusMagic', 1],
            ['lichHealth', 1],
            ['lichMana', 1],
            ['lichHealthMod', 5],
            ['newBossBeaten', 3],
            ['eyeballBossBeaten', 3],
            ['fairyBossBeaten', 3],
            ['fireballBossBeaten', 3],
            ['blobBossBeaten', 3],
            ['lastbossBeaten', 3],
            ['timesCastleBeaten', 1],
            ['numEnemiesBeaten', 1],
            ['tutorialComplete', 3],
            ['characterFound', 3],
            ['loadStartingRoom', 3],
            ['lockCastle', 3],
            ['spokeToBlacksmith', 3],
            ['spokeToEnchantress', 3],
            ['spokeToArchitect', 3],
            ['spokeToTollCollector', 3],
            ['isDead', 3],
            ['finalDoorOpened', 3],
            ['rerolledChildren', 3],
            ['isFemale', 3],
            ['timesDead', 1],
            ['hasArchitectFee', 3],
            ['readLastDiary', 3],
            ['spokenToLastBoss', 3],
            ['hardcoreMode', 3],
            ['totalHoursPlayed', 5],
            ['wizardSpellA', 2],
            ['wizardSpellB', 2],
            ['wizardSpellC', 2]
        ]
    };

    var upgradeSchema = {
        name: "Upgrade",
        items: [
            ['blueprints', 6, 5, 15],
            ['runes', 6, 5, 11],
            ['equipedEquipment', 8, 5],
            ['equipedRunes', 8, 5],
            ['skills', 9, 32]
        ]
    };

    var currentDataView;
    var dataViewTotalByteLength = 0;
    var dataViewReadByteLength = 0;
    var currentSchema;

    Rogue.currentSchemaName = '';
    Rogue.processedObject = '';


    Rogue.getEquipmentName = function (category, base) {
        return (this.equipmentBaseTypes[base] || '')
            + ' ' + (this.equipmentCategories[category] || '');
    }

    Rogue.equipmentFound = function (prop, category, base)
    {
        var status = Rogue.processedObject[prop][category][base];

        return status > 0;
        
    }


    /**
    * Gets the default value for a propertyType
    *
    * @param {number} propertyType The value from propertyTypes to get a default value for
    * @return {any} The default value for the type
    */
    function getDefaultPropertyType(propertyType) {

        switch (propertyType) {
            case 1:  //'Int32'
            case 2: //'Byte'
            case 3: ///'Bool'
            case 5: //'Float32'
                return 0;
            case 6:
            case 7:
            case 8:
            case 9:
                return [];
            case 4:// 'String'
            default:
                return '';
        }

    }


    function getEstimatedByteSize(schema, source) {
        var size = 0;

        for (var i in schema.items) {
            var item = schema.items[i];


            switch (item[1]) {
                case 1:  //'Int32'
                case 5: //'Float32'
                    size += 8;
                    break;
                case 2: //'Byte'
                case 3: ///'Bool'
                    size += 1;
                    break;
                case 4:// 'String'
                    if (source)
                        size += (source[item[0]] || '').length + 1; //+ 1for the 7-bit int header
                    break;
                case 7: // fields
                case 8:
                case 9:
                    size += item[2];
                    break;

                case 6: // array of fields
                    size += (item[2] * item[3]);
                    break;
            }
        }

        return size;
    }


    /**
    * Creates an object based on a schema array
    *
    * @param {jDataView} view The DataView to read from
    * @param {array} schema The schema array used to help build the object
    * @return {object} The built object
    */
    function buildObjectFromSchema(dataView, schema) {

        var ret = {};

        for (var i in schema.items) {
            var item = schema.items[i];
            var args = item.slice(0).splice(2);
            var value = dataView['read' + propertyTypes[item[1]]].apply(dataView, args);

            ret[item[0]] = value || getDefaultPropertyType(item[1]);
        }

        return ret;

    }


    /**
    * Writes an object to a DataView based on a schema array
    *
    * @param {jDataView} view The DataView to write to
    * @param {object} source The object to use for writing
    * @param {array} schema The schema array used to help build the object
    */
    function writeObjectFromSchema(dataView, source, schema) {

        dataView.seek(0);

        for (var i in schema.items) {
            var item = schema.items[i];
            var value = source[item[0]] || getDefaultPropertyType(item[1]);

            dataView['write' + propertyTypes[item[1]]](value);
        }

    }


    function getAppropriateSchema(fileName) {

        if (/RogueLegacyPlayer\.rcdat/.test(fileName))
            return playerSchema;

        if (/RogueLegacyBP\.rcdat/.test(fileName))
            return upgradeSchema;

        return null;
    }


    Rogue.readData = function (data, fileName) {

        currentSchema = getAppropriateSchema(fileName);

        if (!currentSchema)
            throw "Unable to process this file due to lack of schema";

        this.currentSchemaName = currentSchema.name;

        currentDataView = new jDataView(data);
        currentDataView._littleEndian = true;

        this.processedObject = buildObjectFromSchema(currentDataView, currentSchema);

        dataViewTotalByteLength = currentDataView.byteLength;
        dataViewReadByteLength = currentDataView._offset;

    };

    Rogue.commitChanges = function (newObject) {

        for (var prop in newObject) {
            this.processedObject[prop] = newObject[prop];
        }

        // need to write this to a different dataview since the variable size of the string can cause problems.
        // kind of a shitty solution though.     

        var tempView = new jDataView(5000, 0, 5000, true);

        writeObjectFromSchema(tempView, this.processedObject, currentSchema);

        var newViewWriteOffset = tempView._offset;
        var newLength = dataViewTotalByteLength + (newViewWriteOffset - dataViewReadByteLength);

        tempView = tempView.slice(0, newLength, true);

        tempView.seek(newViewWriteOffset);
        currentDataView.seek(dataViewReadByteLength);

        // grab the end of the original profile in case there are things we didn't modify
        var endBytes = currentDataView.getBytes(dataViewTotalByteLength - dataViewReadByteLength, dataViewReadByteLength);

        tempView.setBytes(newViewWriteOffset, endBytes);

        //replace the view, update its stats
        currentDataView = tempView;
        dataViewTotalByteLength = currentDataView.byteLength;
        dataViewReadByteLength = newViewWriteOffset;
    };



    Rogue.downloadFile = function (fileName) {
        var blob = new Blob([currentDataView.buffer]);
        saveAs(blob, fileName);
    };




})(jDataView, (Rogue || (Rogue = {})));
