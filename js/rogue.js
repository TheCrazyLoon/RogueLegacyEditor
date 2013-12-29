
/// <reference path="bootstrap.min.js" />
/// <reference path="jquery-1.10.2.min.js" />
/// <reference path="FileSaver.js" />
/// <reference path="jdataview.js" />

var Rogue;

/* extensions for jDataView */
(function (jDataView, Rogue) {
    "use strict";

    function read7BitInt(view) {
        /// <summary>
        /// Reads a 7-bit integer from the view
        /// </summary>
        /// <param name="view"></param>
        /// <returns type="int"></returns>
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

    function write7BitInt(view, value) {
        /// <summary>
        /// Writes a 7-bit integer to the view
        /// </summary>
        /// <param name="view"></param>
        /// <param name="value"></param>
        for (var n = value; n >= 128; n >>= 7) {
            view.writeInt8(n | 128);
        }
        view.writeInt8(n);
    }


    jDataView.prototype.readString = function () {
        var length = read7BitInt(this);
        return this.getString(length);
    }

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
        return this.getInt8(this._offset, value);
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





})(jDataView, (Rogue || (Rogue = {})));


(function ($, jDataView, Rogue) {
    "use strict";

    var view;
    var originalViewTotalByteLength = 0;
    var originalViewReadByteLength = 0;
    var character = {};

    Rogue.character = character;

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

    Rogue.traits =
    {
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


    Rogue.readData = function (data) {
        view = new jDataView(data);
        view._littleEndian = true;
        Rogue.view = view;

        character = {
            gold: view.readInt32(),
            currentHealth: view.readInt32(),
            currentMana: view.readInt32(),
            age: view.readInt8(),
            childAge: view.readInt8(),
            spell: view.readInt8(),
            classType: view.readInt8(),
            specialItem: view.readInt8(),
            traitsA: view.readInt8(),
            traitsB: view.readInt8(),
            playerName: view.readString(),
            headPiece: view.readInt8(),
            shoulderPiece: view.readInt8(),
            chestPiece: view.readInt8(),
            diaryEntry: view.readInt8(),
            bonusHealth: view.readInt32(),
            bonusStrength: view.readInt32(),
            bonusMana: view.readInt32(),
            bonusDefense: view.readInt32(),
            bonusWeight: view.readInt32(),
            bonusMagic: view.readInt32(),
            lichHealth: view.readInt32(),
            lichMana: view.readInt32(),
            lichHealthMod: view.readFloat32(),
            newBossBeaten: view.readBool(),
            eyeballBossBeaten: view.readBool(),
            fairyBossBeaten: view.readBool(),
            fireballBossBeaten: view.readBool(),
            blobBossBeaten: view.readBool(),
            lastbossBeaten: view.readBool(),
            timesCastleBeaten: view.readInt32(),
            numEnemiesBeaten: view.readInt32(),
            tutorialComplete: view.readBool(),
            characterFound: view.readBool(),
            loadStartingRoom: view.readBool(),
            lockCastle: view.readBool(),
            spokeToBlacksmith: view.readBool(),
            spokeToEnchantress: view.readBool(),
            spokeToArchitect: view.readBool(),
            spokeToTollCollector: view.readBool(),
            isDead: view.readBool(),
            finalDoorOpened: view.readBool(),
            rerolledChildren: view.readBool(),
            isFemale: view.readBool(),
            timesDead: view.readInt32(),
            hasArchitectFee: view.readBool(),
            readLastDiary: view.readBool(),
            spokenToLastBoss: view.readBool(),
            hardcoreMode: view.readBool(),
            totalHoursPlayed: view.readFloat32(),
            wizardSpellA: view.readInt8(),
            wizardSpellB: view.readInt8(),
            wizardSpellC: view.readInt8()
        };

        originalViewTotalByteLength = view.byteLength;
        originalViewReadByteLength = view._offset;

        Rogue.character = character;

    };

    Rogue.mergeCharacter = function (newCharacter) {
        for (var prop in newCharacter) {
            character[prop] = newCharacter[prop];
        }
    };

    Rogue.commitData = function () {

        // need to write this to a different dataview since the variable size of the string can cause problems.
        // kind of a shitty solution though.

        var tempView = new jDataView(5000, 0, 5000, true);

        tempView.writeInt32(character.gold);
        tempView.writeInt32(character.currentHealth);
        tempView.writeInt32(character.currentMana);
        tempView.writeInt8(character.age);
        tempView.writeInt8(character.childAge);
        tempView.writeInt8(character.spell);
        tempView.writeInt8(character.classType);
        tempView.writeInt8(character.specialItem);
        tempView.writeInt8(character.traitsA);
        tempView.writeInt8(character.traitsB);
        tempView.writeString(character.playerName);
        tempView.writeInt8(character.headPiece);
        tempView.writeInt8(character.shoulderPiece);
        tempView.writeInt8(character.chestPiece);
        tempView.writeInt8(character.diaryEntry);

        tempView.writeInt32(character.bonusHealth);
        tempView.writeInt32(character.bonusStrength);
        tempView.writeInt32(character.bonusMana);
        tempView.writeInt32(character.bonusDefense);
        tempView.writeInt32(character.bonusWeight);
        tempView.writeInt32(character.bonusMagic);

        tempView.writeInt32(character.lichHealth);
        tempView.writeInt32(character.lichMana);

        tempView.writeFloat32(character.lichHealthMod);

        tempView.writeBool(character.newBossBeaten);
        tempView.writeBool(character.eyeballBossBeaten);
        tempView.writeBool(character.fairyBossBeaten);
        tempView.writeBool(character.fireballBossBeaten);
        tempView.writeBool(character.blobBossBeaten);
        tempView.writeBool(character.lastbossBeaten);

        tempView.writeInt32(character.timesCastleBeaten);
        tempView.writeInt32(character.numEnemiesBeaten);

        tempView.writeBool(character.tutorialComplete);
        tempView.writeBool(character.characterFound);
        tempView.writeBool(character.loadStartingRoom);
        tempView.writeBool(character.lockCastle);
        tempView.writeBool(character.spokeToBlacksmith);
        tempView.writeBool(character.spokeToEnchantress);
        tempView.writeBool(character.spokeToArchitect);
        tempView.writeBool(character.spokeToTollCollector);
        tempView.writeBool(character.isDead);
        tempView.writeBool(character.finalDoorOpened);
        tempView.writeBool(character.rerolledChildren);
        tempView.writeBool(character.isFemale);

        tempView.writeInt32(character.timesDead);
        tempView.writeBool(character.hasArchitectFee);
        tempView.writeBool(character.readLastDiary);
        tempView.writeBool(character.spokenToLastBoss);
        tempView.writeBool(character.hardcoreMode);
        tempView.writeFloat32(character.totalHoursPlayed);

        tempView.writeInt8(character.wizardSpellA);
        tempView.writeInt8(character.wizardSpellB);
        tempView.writeInt8(character.wizardSpellC);


        var newViewWriteOffset = tempView._offset;
        var newLength = originalViewTotalByteLength + (newViewWriteOffset - originalViewReadByteLength);

        tempView = tempView.slice(0, newLength, true);

        tempView.seek(newViewWriteOffset);
        view.seek(originalViewReadByteLength);

        // grab the end of the original profile in case there are things we didn't modify
        var endBytes = view.getBytes(originalViewTotalByteLength - originalViewReadByteLength, originalViewReadByteLength);

        tempView.setBytes(newViewWriteOffset, endBytes);

        //replace the view
        view = tempView;
    };

    Rogue.saveCharacterToFile = function (fileName) {
        var blob = new Blob([view.buffer]);
        saveAs(blob, fileName);
    };





})(jQuery, jDataView, (Rogue || (Rogue = {})));
