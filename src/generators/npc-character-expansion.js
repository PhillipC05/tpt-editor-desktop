/**
 * NPC Character Expansion - Expand from 12 to 50+ character types for NPCs
 * Generates diverse fantasy RPG characters with professions, races, and personalities
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');

class NPCCharacterExpansion {
    constructor() {
        // Character categories
        this.categories = {
            PROFESSIONALS: 'professionals',
            MERCHANTS: 'merchants',
            GUARDS: 'guards',
            NOBLES: 'nobles',
            SCHOLARS: 'scholars',
            ARTISANS: 'artisans',
            ENTERTAINERS: 'entertainers',
            RELIGIOUS: 'religious',
            OUTSIDERS: 'outsiders',
            MYSTICAL: 'mystical'
        };

        // Fantasy races
        this.races = {
            HUMAN: 'human',
            ELF: 'elf',
            DWARF: 'dwarf',
            HALFLING: 'halfling',
            ORC: 'orc',
            GNOME: 'gnome',
            HALF_ELF: 'half-elf',
            HALF_ORC: 'half-orc',
            TIEFLING: 'tiefling',
            DRAGONBORN: 'dragonborn'
        };

        // Character traits
        this.traits = {
            PERSONALITY: ['friendly', 'gruff', 'wise', 'mysterious', 'cheerful', 'stern', 'eccentric', 'noble', 'humble', 'arrogant'],
            PHYSICAL: ['tall', 'short', 'muscular', 'slender', 'aged', 'youthful', 'scarred', 'elegant', 'rough', 'refined'],
            BEHAVIOR: ['helpful', 'suspicious', 'knowledgeable', 'deceptive', 'loyal', 'untrustworthy', 'curious', 'apathetic', 'enthusiastic', 'cynical']
        };

        // Base character templates
        this.baseTemplates = {
            [this.categories.PROFESSIONALS]: [
                { name: 'Blacksmith', description: 'Forged weapons and armor', traits: ['muscular', 'sooty', 'skilled'] },
                { name: 'Innkeeper', description: 'Runs the local tavern', traits: ['jovial', 'experienced', 'social'] },
                { name: 'Farmer', description: 'Works the land', traits: ['hardy', 'simple', 'reliable'] },
                { name: 'Fisherman', description: 'Catches fish from the sea', traits: ['weathered', 'patient', 'resourceful'] },
                { name: 'Hunter', description: 'Tracks game in the wilds', traits: ['stealthy', 'observant', 'independent'] },
                { name: 'Miner', description: 'Extracts ore from mountains', traits: ['strong', 'dusty', 'enduring'] },
                { name: 'Carpenter', description: 'Builds with wood', traits: ['precise', 'practical', 'creative'] },
                { name: 'Tailor', description: 'Creates clothing', traits: ['detailed', 'artistic', 'patient'] },
                { name: 'Baker', description: 'Makes bread and pastries', traits: ['warm', 'floury', 'nurturing'] },
                { name: 'Butcher', description: 'Prepares meat', traits: ['robust', 'bloody', 'direct'] }
            ],
            [this.categories.MERCHANTS]: [
                { name: 'General Store Owner', description: 'Sells everyday goods', traits: ['merchant', 'calculating', 'sociable'] },
                { name: 'Weapons Merchant', description: 'Deals in arms and armor', traits: ['sharp', 'experienced', 'guarded'] },
                { name: 'Herbalist', description: 'Sells potions and herbs', traits: ['wise', 'mysterious', 'healing'] },
                { name: 'Jeweler', description: 'Creates and sells jewelry', traits: ['refined', 'artistic', 'wealthy'] },
                { name: 'Book Seller', description: 'Trades in tomes and scrolls', traits: ['learned', 'dusty', 'curious'] },
                { name: 'Spice Merchant', description: 'Imports exotic spices', traits: ['worldly', 'aromatic', 'cultured'] },
                { name: 'Alchemist', description: 'Brews potions and elixirs', traits: ['scientific', 'cautious', 'innovative'] },
                { name: 'Art Dealer', description: 'Buys and sells art', traits: ['aesthetic', 'sophisticated', 'discerning'] },
                { name: 'Tavern Owner', description: 'Runs drinking establishment', traits: ['social', 'experienced', 'resilient'] },
                { name: 'Banker', description: 'Manages money and loans', traits: ['precise', 'trustworthy', 'calculating'] }
            ],
            [this.categories.GUARDS]: [
                { name: 'City Guard Captain', description: 'Leads the city watch', traits: ['authoritative', 'disciplined', 'protective'] },
                { name: 'Gate Guard', description: 'Controls city entrance', traits: ['vigilant', 'stern', 'dutiful'] },
                { name: 'Patrol Guard', description: 'Walks city streets', traits: ['observant', 'tired', 'dedicated'] },
                { name: 'Castle Guard', description: 'Protects the keep', traits: ['loyal', 'armored', 'stoic'] },
                { name: 'Watchman', description: 'Night patrol duty', traits: ['sleepy', 'alert', 'reliable'] },
                { name: 'Royal Guard', description: 'Elite palace protection', traits: ['elite', 'proud', 'disciplined'] },
                { name: 'Mercenary Guard', description: 'Hired protection', traits: ['rough', 'experienced', 'loyal'] },
                { name: 'Temple Guard', description: 'Protects holy sites', traits: ['devout', 'armored', 'vigilant'] },
                { name: 'Caravan Guard', description: 'Protects traveling merchants', traits: ['travelled', 'hardy', 'protective'] },
                { name: 'Prison Guard', description: 'Oversees captives', traits: ['hardened', 'suspicious', 'strict'] }
            ],
            [this.categories.NOBLES]: [
                { name: 'Lord', description: 'Rules local lands', traits: ['noble', 'commanding', 'wealthy'] },
                { name: 'Lady', description: 'Noble woman of status', traits: ['elegant', 'refined', 'influential'] },
                { name: 'Baron', description: 'Minor noble title', traits: ['proud', 'landed', 'traditional'] },
                { name: 'Countess', description: 'Female count', traits: ['sophisticated', 'political', 'cultured'] },
                { name: 'Duke', description: 'High noble rank', traits: ['powerful', 'aristocratic', 'commanding'] },
                { name: 'Earl', description: 'Noble landowner', traits: ['traditional', 'hunting', 'conservative'] },
                { name: 'Viscount', description: 'Noble deputy', traits: ['ambitious', 'refined', 'political'] },
                { name: 'Marquess', description: 'Border territory ruler', traits: ['strategic', 'military', 'diplomatic'] },
                { name: 'Knight', description: 'Honorable warrior', traits: ['chivalrous', 'brave', 'honorable'] },
                { name: 'Courtier', description: 'Royal court attendant', traits: ['intriguing', 'political', 'sophisticated'] }
            ],
            [this.categories.SCHOLARS]: [
                { name: 'Librarian', description: 'Curates ancient tomes', traits: ['learned', 'dusty', 'methodical'] },
                { name: 'Historian', description: 'Studies past events', traits: ['wise', 'detailed', 'narrative'] },
                { name: 'Astrologer', description: 'Reads the stars', traits: ['mystical', 'observant', 'predictive'] },
                { name: 'Cartographer', description: 'Maps the world', traits: ['precise', 'adventurous', 'detailed'] },
                { name: 'Archaeologist', description: 'Studies ancient ruins', traits: ['curious', 'dusty', 'patient'] },
                { name: 'Linguist', description: 'Studies languages', traits: ['polyglot', 'analytical', 'communicative'] },
                { name: 'Philosopher', description: 'Contemplates existence', traits: ['thoughtful', 'abstract', 'wise'] },
                { name: 'Mathematician', description: 'Studies numbers', traits: ['logical', 'precise', 'abstract'] },
                { name: 'Naturalist', description: 'Studies nature', traits: ['observant', 'patient', 'curious'] },
                { name: 'Theologian', description: 'Studies divine matters', traits: ['devout', 'learned', 'contemplative'] }
            ],
            [this.categories.ARTISANS]: [
                { name: 'Potter', description: 'Creates ceramic wares', traits: ['creative', 'muddy', 'skilled'] },
                { name: 'Glassblower', description: 'Shapes molten glass', traits: ['artistic', 'hot', 'precise'] },
                { name: 'Leatherworker', description: 'Works with hides', traits: ['practical', 'odorous', 'durable'] },
                { name: 'Weaver', description: 'Creates cloth', traits: ['detailed', 'patient', 'artistic'] },
                { name: 'Stone Mason', description: 'Carves stone', traits: ['strong', 'dusty', 'architectural'] },
                { name: 'Metal Smith', description: 'Works precious metals', traits: ['refined', 'hot', 'artistic'] },
                { name: 'Wood Carver', description: 'Sculpts wood', traits: ['creative', 'sawdusty', 'detailed'] },
                { name: 'Painter', description: 'Creates visual art', traits: ['artistic', 'colorful', 'expressive'] },
                { name: 'Sculptor', description: 'Shapes stone and metal', traits: ['creative', 'dusty', 'powerful'] },
                { name: 'Instrument Maker', description: 'Builds musical instruments', traits: ['musical', 'precise', 'artistic'] }
            ],
            [this.categories.ENTERTAINERS]: [
                { name: 'Bard', description: 'Travelling musician', traits: ['charismatic', 'musical', 'storytelling'] },
                { name: 'Jester', description: 'Court fool', traits: ['humorous', 'colorful', 'clever'] },
                { name: 'Actor', description: 'Performs in plays', traits: ['dramatic', 'expressive', 'versatile'] },
                { name: 'Dancer', description: 'Performs dances', traits: ['graceful', 'athletic', 'artistic'] },
                { name: 'Storyteller', description: 'Shares tales', traits: ['narrative', 'engaging', 'memory'] },
                { name: 'Musician', description: 'Plays instruments', traits: ['musical', 'expressive', 'emotional'] },
                { name: 'Acrobat', description: 'Performs feats', traits: ['athletic', 'daring', 'flexible'] },
                { name: 'Magician', description: 'Performs illusions', traits: ['mysterious', 'sleight', 'entertaining'] },
                { name: 'Singer', description: 'Vocal performer', traits: ['musical', 'emotional', 'expressive'] },
                { name: 'Puppeteer', description: 'Controls puppets', traits: ['creative', 'manipulative', 'entertaining'] }
            ],
            [this.categories.RELIGIOUS]: [
                { name: 'Priest', description: 'Serves the faith', traits: ['devout', 'compassionate', 'guiding'] },
                { name: 'Monk', description: 'Lives in monastery', traits: ['disciplined', 'meditative', 'humble'] },
                { name: 'Nun', description: 'Religious sister', traits: ['devout', 'caring', 'spiritual'] },
                { name: 'Paladin', description: 'Holy warrior', traits: ['righteous', 'brave', 'protective'] },
                { name: 'Shaman', description: 'Spirit communicator', traits: ['mystical', 'wise', 'connected'] },
                { name: 'Druid', description: 'Nature priest', traits: ['natural', 'wise', 'protective'] },
                { name: 'Oracle', description: 'Divine prophet', traits: ['mystical', 'wise', 'prophetic'] },
                { name: 'High Priest', description: 'Religious leader', traits: ['authoritative', 'wise', 'spiritual'] },
                { name: 'Inquisitor', description: 'Faith enforcer', traits: ['stern', 'devout', 'investigative'] },
                { name: 'Healer', description: 'Faith healer', traits: ['compassionate', 'divine', 'nurturing'] }
            ],
            [this.categories.OUTSIDERS]: [
                { name: 'Traveller', description: 'Wanders the roads', traits: ['experienced', 'worldly', 'independent'] },
                { name: 'Refugee', description: 'Fled from danger', traits: ['traumatized', 'resilient', 'grateful'] },
                { name: 'Nomad', description: 'Lives on the move', traits: ['free', 'adaptable', 'resourceful'] },
                { name: 'Exile', description: 'Banished from home', traits: ['bitter', 'surviving', 'wary'] },
                { name: 'Explorer', description: 'Seeks new lands', traits: ['curious', 'brave', 'adventurous'] },
                { name: 'Hermit', description: 'Lives in isolation', traits: ['solitary', 'wise', 'self-sufficient'] },
                { name: 'Bandit', description: 'Road robber', traits: ['dangerous', 'desperate', 'ruthless'] },
                { name: 'Pirate', description: 'Sea raider', traits: ['salty', 'brave', 'treacherous'] },
                { name: 'Smuggler', description: 'Illegal trader', traits: ['sneaky', 'connected', 'risky'] },
                { name: 'Adventurer', description: 'Quest seeker', traits: ['brave', 'experienced', 'optimistic'] }
            ],
            [this.categories.MYSTICAL]: [
                { name: 'Wizard', description: 'Studies arcane magic', traits: ['learned', 'mysterious', 'powerful'] },
                { name: 'Sorcerer', description: 'Innate magical ability', traits: ['charismatic', 'powerful', 'unpredictable'] },
                { name: 'Enchanter', description: 'Creates magical items', traits: ['creative', 'mystical', 'valuable'] },
                { name: 'Necromancer', description: 'Commands the dead', traits: ['dark', 'powerful', 'unholy'] },
                { name: 'Elementalist', description: 'Controls elements', traits: ['powerful', 'temperamental', 'destructive'] },
                { name: 'Illusionist', description: 'Creates illusions', traits: ['deceptive', 'creative', 'mysterious'] },
                { name: 'Summoner', description: 'Calls creatures', traits: ['powerful', 'connected', 'dangerous'] },
                { name: 'Rune Master', description: 'Uses ancient runes', traits: ['ancient', 'wise', 'powerful'] },
                { name: 'Crystal Mage', description: 'Uses crystal magic', traits: ['mystical', 'pure', 'powerful'] },
                { name: 'Shadow Walker', description: 'Moves through shadows', traits: ['stealthy', 'dark', 'mysterious'] }
            ]
        };

        // Generate expanded character list
        this.expandedCharacters = this.generateExpandedCharacters();
    }

    /**
     * Generate expanded character list (50+ types)
     */
    generateExpandedCharacters() {
        const characters = [];
        let id = 1;

        // Generate characters by combining templates with races and traits
        for (const [category, templates] of Object.entries(this.baseTemplates)) {
            for (const template of templates) {
                // Create 2-3 variations per template with different races
                const raceVariations = this.getRandomRaces(3);

                for (const race of raceVariations) {
                    const character = {
                        id: id++,
                        name: this.generateCharacterName(template.name, race),
                        profession: template.name,
                        race: race,
                        category: category,
                        description: template.description,
                        traits: [...template.traits, ...this.generateRandomTraits()],
                        appearance: this.generateAppearance(race, template.traits),
                        personality: this.generatePersonality(),
                        dialogue: this.generateDialogueOptions(template.name),
                        stats: this.generateStats(template.name, race),
                        equipment: this.generateEquipment(template.name),
                        background: this.generateBackground(template.name, race),
                        relationships: this.generateRelationships(),
                        schedule: this.generateSchedule(template.name),
                        quests: this.generateQuests(template.name)
                    };

                    characters.push(character);
                }
            }
        }

        return characters;
    }

    /**
     * Get random races for variation
     */
    getRandomRaces(count) {
        const raceKeys = Object.keys(this.races);
        const selected = [];

        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * raceKeys.length);
            selected.push(raceKeys[randomIndex]);
        }

        return [...new Set(selected)]; // Remove duplicates
    }

    /**
     * Generate character name
     */
    generateCharacterName(profession, race) {
        const firstNames = {
            [this.races.HUMAN]: ['Aldric', 'Beatrice', 'Cedric', 'Diana', 'Edward', 'Fiona', 'Gareth', 'Helena'],
            [this.races.ELF]: ['Aeliana', 'Bryn', 'Ciaran', 'Dara', 'Elowen', 'Finnian', 'Galatea', 'Haldir'],
            [this.races.DWARF]: ['Balin', 'Daina', 'Gimli', 'Helga', 'Kili', 'Moria', 'Thrain', 'Urist'],
            [this.races.HALFLING]: ['Bilbo', 'Cora', 'Dilly', 'Elara', 'Ferdinand', 'Gilda', 'Hobart', 'Ivy'],
            [this.races.ORC]: ['Grishnak', 'Hrogath', 'Igrush', 'Jorgath', 'Kragor', 'Lurka', 'Mogrok', 'Nagruk'],
            [this.races.GNOME]: ['Bizzle', 'Cogsprocket', 'Dabwick', 'Fizzlebang', 'Gadget', 'Hobnob', 'Ingenius', 'Jingle'],
            [this.races.HALF_ELF]: ['Alyndra', 'Baelin', 'Corwin', 'Daelin', 'Elyndor', 'Faelar', 'Gaelin', 'Haelin'],
            [this.races.HALF_ORC]: ['Drak', 'Gorim', 'Hrothgar', 'Ironskin', 'Jarl', 'Korrin', 'Lothar', 'Mordin'],
            [this.races.TIEFLING]: ['Akmenios', 'Damakos', 'Ekemon', 'Fleron', 'Gorthok', 'Hesperos', 'Iados', 'Jelenneth'],
            [this.races.DRAGONBORN]: ['Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh', 'Heskan', 'Kriv', 'Medrash']
        };

        const lastNames = {
            [this.races.HUMAN]: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'],
            [this.races.ELF]: ['Moonwhisper', 'Stormweaver', 'Lightfoot', 'Shadowbrook', 'Starweaver', 'Windrider'],
            [this.races.DWARF]: ['Ironfist', 'Stonebreaker', 'Goldvein', 'Deepdelver', 'Hammerfall', 'Steelheart'],
            [this.races.HALFLING]: ['Goodbarrel', 'Greenbottle', 'Hilltopple', 'Took', 'Baggins', 'Brandybuck'],
            [this.races.ORC]: ['Bloodaxe', 'Bonecrusher', 'Ironhide', 'Skullsplitter', 'Warbringer', 'Deathdealer'],
            [this.races.GNOME]: ['Gearspinner', 'Widgetwhistle', 'Cogsworth', 'Boltbuckle', 'Springcoil', 'Chainlink'],
            [this.races.HALF_ELF]: ['Silverleaf', 'Stormborn', 'Lightbringer', 'Shadowwalker', 'Starborn', 'Windwalker'],
            [this.races.HALF_ORC]: ['Ironfist', 'Stonebreaker', 'Bloodaxe', 'Bonecrusher', 'Warbringer', 'Deathdealer'],
            [this.races.TIEFLING]: ['Darkflame', 'Hellfire', 'Shadowborn', 'Demonheart', 'Infernal', 'Abyssal'],
            [this.races.DRAGONBORN]: ['Firebreath', 'Stormscale', 'Goldwing', 'Silverclaw', 'Bronzeshield', 'Ironscale']
        };

        const firstName = firstNames[race] ? firstNames[race][Math.floor(Math.random() * firstNames[race].length)] : 'Unknown';
        const lastName = lastNames[race] ? lastNames[race][Math.floor(Math.random() * lastNames[race].length)] : '';

        return lastName ? `${firstName} ${lastName}` : firstName;
    }

    /**
     * Generate random traits
     */
    generateRandomTraits() {
        const personality = this.traits.PERSONALITY[Math.floor(Math.random() * this.traits.PERSONALITY.length)];
        const physical = this.traits.PHYSICAL[Math.floor(Math.random() * this.traits.PHYSICAL.length)];
        const behavior = this.traits.BEHAVIOR[Math.floor(Math.random() * this.traits.BEHAVIOR.length)];

        return [personality, physical, behavior];
    }

    /**
     * Generate appearance based on race and traits
     */
    generateAppearance(race, traits) {
        const appearances = {
            [this.races.HUMAN]: {
                hair: ['brown', 'black', 'blonde', 'red', 'gray'],
                eyes: ['brown', 'blue', 'green', 'hazel'],
                skin: ['fair', 'tan', 'olive', 'dark'],
                build: ['average', 'athletic', 'stocky', 'slender']
            },
            [this.races.ELF]: {
                hair: ['silver', 'golden', 'white', 'black', 'red'],
                eyes: ['emerald', 'sapphire', 'amber', 'violet'],
                skin: ['pale', 'fair', 'olive'],
                build: ['slender', 'graceful', 'ethereal']
            },
            [this.races.DWARF]: {
                hair: ['red', 'brown', 'black', 'gray', 'white'],
                eyes: ['brown', 'hazel', 'blue'],
                skin: ['fair', 'ruddy', 'tan'],
                build: ['stocky', 'muscular', 'sturdy']
            },
            [this.races.HALFLING]: {
                hair: ['brown', 'blonde', 'red', 'black'],
                eyes: ['brown', 'blue', 'green'],
                skin: ['fair', 'tan', 'olive'],
                build: ['plump', 'sturdy', 'nimble']
            },
            [this.races.ORC]: {
                hair: ['black', 'brown', 'none'],
                eyes: ['yellow', 'red', 'brown'],
                skin: ['green', 'gray', 'brown'],
                build: ['massive', 'muscular', 'intimidating']
            },
            [this.races.GNOME]: {
                hair: ['red', 'brown', 'white', 'blue', 'green'],
                eyes: ['blue', 'green', 'brown'],
                skin: ['fair', 'tan', 'ruddy'],
                build: ['small', 'spry', 'energetic']
            }
        };

        const raceAppearance = appearances[race] || appearances[this.races.HUMAN];

        return {
            hair: raceAppearance.hair[Math.floor(Math.random() * raceAppearance.hair.length)],
            eyes: raceAppearance.eyes[Math.floor(Math.random() * raceAppearance.eyes.length)],
            skin: raceAppearance.skin[Math.floor(Math.random() * raceAppearance.skin.length)],
            build: raceAppearance.build[Math.floor(Math.random() * raceAppearance.build.length)],
            distinctive: traits[Math.floor(Math.random() * traits.length)]
        };
    }

    /**
     * Generate personality
     */
    generatePersonality() {
        const personalities = [
            'Friendly and helpful',
            'Gruff but fair',
            'Wise and knowledgeable',
            'Mysterious and secretive',
            'Cheerful and optimistic',
            'Stern and disciplined',
            'Eccentric and unusual',
            'Noble and honorable',
            'Humble and unassuming',
            'Arrogant and proud'
        ];

        return personalities[Math.floor(Math.random() * personalities.length)];
    }

    /**
     * Generate dialogue options
     */
    generateDialogueOptions(profession) {
        const dialogues = {
            'Blacksmith': [
                'What can I forge for you today?',
                'Fine craftsmanship takes time, but it\'s worth it.',
                'This blade will serve you well in battle.'
            ],
            'Innkeeper': [
                'Welcome to my establishment! Care for a drink?',
                'The best ale in town, guaranteed!',
                'We have rooms available if you need a place to stay.'
            ],
            'Guard': [
                'Everything seems quiet tonight.',
                'Move along, citizen. Nothing to see here.',
                'The city is under my protection.'
            ]
        };

        return dialogues[profession] || [
            'Hello there, traveler.',
            'What brings you to our town?',
            'I might be able to help you with that.'
        ];
    }

    /**
     * Generate character stats
     */
    generateStats(profession, race) {
        const baseStats = {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        };

        // Racial modifiers
        const racialMods = {
            [this.races.DWARF]: { constitution: 2, strength: 1 },
            [this.races.ELF]: { dexterity: 2, intelligence: 1 },
            [this.races.ORC]: { strength: 2, constitution: 1 },
            [this.races.GNOME]: { intelligence: 2, dexterity: 1 },
            [this.races.HALFLING]: { dexterity: 2, charisma: 1 }
        };

        // Profession modifiers
        const professionMods = {
            'Blacksmith': { strength: 3, constitution: 2 },
            'Guard': { strength: 2, constitution: 2 },
            'Wizard': { intelligence: 3, wisdom: 2 },
            'Bard': { charisma: 3, dexterity: 2 }
        };

        // Apply modifiers
        const raceMod = racialMods[race] || {};
        const profMod = professionMods[profession] || {};

        return {
            strength: baseStats.strength + (raceMod.strength || 0) + (profMod.strength || 0),
            dexterity: baseStats.dexterity + (raceMod.dexterity || 0) + (profMod.dexterity || 0),
            constitution: baseStats.constitution + (raceMod.constitution || 0) + (profMod.constitution || 0),
            intelligence: baseStats.intelligence + (raceMod.intelligence || 0) + (profMod.intelligence || 0),
            wisdom: baseStats.wisdom + (raceMod.wisdom || 0) + (profMod.wisdom || 0),
            charisma: baseStats.charisma + (raceMod.charisma || 0) + (profMod.charisma || 0)
        };
    }

    /**
     * Generate equipment
     */
    generateEquipment(profession) {
        const equipment = {
            'Blacksmith': ['hammer', 'apron', 'gloves', 'tongs'],
            'Guard': ['sword', 'armor', 'helmet', 'shield'],
            'Merchant': ['ledger', 'scales', 'purse', 'samples'],
            'Wizard': ['staff', 'robe', 'spellbook', 'components'],
            'Priest': ['holy symbol', 'robes', 'prayer book', 'incense']
        };

        return equipment[profession] || ['clothing', 'tools'];
    }

    /**
     * Generate background story
     */
    generateBackground(profession, race) {
        const backgrounds = [
            `A ${race} ${profession.toLowerCase()} who has lived in this town their entire life.`,
            `Originally from a distant land, this ${race} came here to pursue their calling as a ${profession.toLowerCase()}.`,
            `After years of training, this ${race} has become one of the most respected ${profession.toLowerCase()}s in the region.`,
            `This ${race} ${profession.toLowerCase()} has seen many changes in the town over the years.`,
            `A ${race} who chose the path of a ${profession.toLowerCase()} after a life-changing event.`
        ];

        return backgrounds[Math.floor(Math.random() * backgrounds.length)];
    }

    /**
     * Generate relationships
     */
    generateRelationships() {
        const relationships = [
            'Has a spouse and two children',
            'Lives alone but has many friends',
            'Part of a large extended family',
            'Recently widowed, still grieving',
            'Close relationship with a mentor figure'
        ];

        return relationships[Math.floor(Math.random() * relationships.length)];
    }

    /**
     * Generate daily schedule
     */
    generateSchedule(profession) {
        const schedules = {
            'Blacksmith': [
                '6:00 AM - Wake up and prepare forge',
                '7:00 AM - Start working on orders',
                '12:00 PM - Lunch break',
                '1:00 PM - Continue work',
                '6:00 PM - Close shop',
                '7:00 PM - Dinner and family time'
            ],
            'Guard': [
                '6:00 AM - Morning briefing',
                '7:00 AM - Start patrol',
                '12:00 PM - Lunch break',
                '1:00 PM - Continue patrol',
                '6:00 PM - End shift',
                '7:00 PM - Off-duty activities'
            ],
            'Merchant': [
                '7:00 AM - Open shop',
                '8:00 AM - Serve customers',
                '12:00 PM - Lunch break',
                '1:00 PM - Continue business',
                '6:00 PM - Close shop',
                '7:00 PM - Count earnings'
            ]
        };

        return schedules[profession] || [
            '7:00 AM - Start work',
            '12:00 PM - Lunch break',
            '5:00 PM - End work',
            '6:00 PM - Evening activities'
        ];
    }

    /**
     * Generate quests or tasks
     */
    generateQuests(profession) {
        const quests = {
            'Blacksmith': [
                'Forge a special sword for the local lord',
                'Repair damaged armor from recent battle',
                'Create horseshoes for the town\'s mounts'
            ],
            'Guard': [
                'Investigate recent thefts in the market',
                'Train new recruits for the city watch',
                'Patrol the dangerous parts of town'
            ],
            'Merchant': [
                'Acquire rare spices from traveling caravan',
                'Negotiate better prices with suppliers',
                'Organize inventory and stock shelves'
            ]
        };

        return quests[profession] || [
            'Complete daily work tasks',
            'Help local townsfolk',
            'Maintain professional standards'
        ];
    }

    /**
     * Get all expanded characters
     */
    getAllCharacters() {
        return this.expandedCharacters;
    }

    /**
     * Get characters by category
     */
    getCharactersByCategory(category) {
        return this.expandedCharacters.filter(char => char.category === category);
    }

    /**
     * Get characters by race
     */
    getCharactersByRace(race) {
        return this.expandedCharacters.filter(char => char.race === race);
    }

    /**
     * Get characters by profession
     */
    getCharactersByProfession(profession) {
        return this.expandedCharacters.filter(char => char.profession === profession);
    }

    /**
     * Get random character
     */
    getRandomCharacter() {
        const randomIndex = Math.floor(Math.random() * this.expandedCharacters.length);
        return this.expandedCharacters[randomIndex];
    }

    /**
     * Get characters with specific traits
     */
    getCharactersWithTrait(trait) {
        return this.expandedCharacters.filter(char =>
            char.traits.some(charTrait => charTrait.toLowerCase().includes(trait.toLowerCase()))
        );
    }

    /**
     * Generate character sprite (placeholder for actual sprite generation)
     */
    async generateCharacterSprite(character, options = {}) {
        const width = options.width || 32;
        const height = options.height || 32;

        // Create a simple colored rectangle as placeholder
        const image = new Jimp(width, height, this.getRaceColor(character.race));

        // Add some simple features based on traits
        if (character.traits.includes('muscular')) {
            // Add some darker pixels for muscle definition
            for (let x = 8; x < 24; x++) {
                for (let y = 12; y < 20; y++) {
                    if (Math.random() > 0.7) {
                        image.setPixelColor(0xFF333333, x, y);
                    }
                }
            }
        }

        return image;
    }

    /**
     * Get color for race
     */
    getRaceColor(race) {
        const colors = {
            [this.races.HUMAN]: 0xFFDEB887,     // Peach
            [this.races.ELF]: 0xFFE6E6FA,       // Lavender
            [this.races.DWARF]: 0xFFD2B48C,     // Tan
            [this.races.HALFLING]: 0xFFFFEBCD,  // Blanched almond
            [this.races.ORC]: 0xFF228B22,       // Forest green
            [this.races.GNOME]: 0xFFFFD700,     // Gold
            [this.races.HALF_ELF]: 0xFFF0E68C,  // Khaki
            [this.races.HALF_ORC]: 0xFF32CD32,  // Lime green
            [this.races.TIEFLING]: 0xFFDC143C,  // Crimson
            [this.races.DRAGONBORN]: 0xFF4169E1  // Royal blue
        };

        return colors[race] || colors[this.races.HUMAN];
    }

    /**
     * Export characters to JSON
     */
    async exportToJSON(outputPath) {
        const data = {
            metadata: {
                totalCharacters: this.expandedCharacters.length,
                categories: Object.keys(this.categories),
                races: Object.keys(this.races),
                generated: new Date().toISOString(),
                version: '1.0'
            },
            characters: this.expandedCharacters
        };

        await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf8');
        return outputPath;
    }

    /**
     * Export characters to CSV
     */
    async exportToCSV(outputPath) {
        let csv = 'ID,Name,Profession,Race,Category,Description,Traits,Personality\n';

        for (const character of this.expandedCharacters) {
            const traits = character.traits.join(';');
            csv += `${character.id},"${character.name}","${character.profession}","${character.race}","${character.category}","${character.description}","${traits}","${character.personality}"\n`;
        }

        await fs.writeFile(outputPath, csv, 'utf8');
        return outputPath;
    }

    /**
     * Generate character sprites for all characters
     */
    async generateAllCharacterSprites(outputDir, options = {}) {
        const spritePromises = this.expandedCharacters.map(async (character) => {
            const sprite = await this.generateCharacterSprite(character, options);
            const filename = `${character.id}_${character.name.replace(/\s+/g, '_').toLowerCase()}.png`;
            const filepath = path.join(outputDir, filename);

            await sprite.writeAsync(filepath);
            return { character: character.id, path: filepath };
        });

        return await Promise.all(spritePromises);
    }

    /**
     * Get statistics about the character expansion
     */
    getStatistics() {
        const stats = {
            totalCharacters: this.expandedCharacters.length,
            categories: {},
            races: {},
            professions: {}
        };

        for (const character of this.expandedCharacters) {
            // Count categories
            stats.categories[character.category] = (stats.categories[character.category] || 0) + 1;

            // Count races
            stats.races[character.race] = (stats.races[character.race] || 0) + 1;

            // Count professions
            stats.professions[character.profession] = (stats.professions[character.profession] || 0) + 1;
        }

        return stats;
    }

    /**
     * Search characters by criteria
     */
    searchCharacters(criteria) {
        return this.expandedCharacters.filter(character => {
            // Search by name
            if (criteria.name && !character.name.toLowerCase().includes(criteria.name.toLowerCase())) {
                return false;
            }

            // Search by profession
            if (criteria.profession && character.profession !== criteria.profession) {
                return false;
            }

            // Search by race
            if (criteria.race && character.race !== criteria.race) {
                return false;
            }

            // Search by category
            if (criteria.category && character.category !== criteria.category) {
                return false;
            }

            // Search by traits
            if (criteria.trait) {
                const hasTrait = character.traits.some(trait =>
                    trait.toLowerCase().includes(criteria.trait.toLowerCase())
                );
                if (!hasTrait) return false;
            }

            return true;
        });
    }
}

module.exports = NPCCharacterExpansion;
