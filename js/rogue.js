
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

    jDataView.prototype.readInt8 = function (value) {
        return parseInt(this.getInt8(this._offset, value));
    }

    jDataView.prototype.writeInt8 = function (value) {
        this.setInt8(this._offset, value);
    }

    jDataView.prototype.readFloat32 = function (value) {
        return this.getFloat32(this._offset, value);
    }

    jDataView.prototype.writeFloat32 = function (value) {
        this.setFloat32(this._offset, value);
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

    var propertyTypes = {
        1: 'Int32',
        2: 'Int8',
        3: 'Bool',
        4: 'String',
        5: 'Float32'
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



    var currentDataView;
    var dataViewTotalByteLength = 0;
    var dataViewReadByteLength = 0;
    var currentSchema;

    Rogue.currentSchemaName = '';
    Rogue.processedObject = '';


    /**
    * Gets the default value for a propertyType
    *
    * @param {number} propertyType The value from propertyTypes to get a default value for
    * @return {any} The default value for the type
    */
    function getDefaultPropertyType(propertyType) {

        switch (propertyType) {
            case 1:  //'Int32'
            case 2: //'Int8'
            case 3: ///'Bool'
            case 5: //'Float32'
                return 0;
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
                case 2: //'Int8'
                case 3: ///'Bool'
                    size += 1;
                    break;
                case 4:// 'String'
                    if (source)
                        size += (source[item[0]] || '').length + 1; //+ 1for the 7-bit int header
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
            var value = dataView['read' + propertyTypes[item[1]]]();

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
