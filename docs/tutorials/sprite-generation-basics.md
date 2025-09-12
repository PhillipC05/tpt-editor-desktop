# Sprite Generation Basics

Learn the fundamentals of generating sprites with TPT Asset Editor.

## 🎨 **Understanding Sprite Generators**

Sprites are 2D images used in games for characters, items, environments, and effects. TPT Asset Editor provides 75+ specialized generators to create professional-quality sprites procedurally.

## 📋 **Generator Categories**

### **Character Generators**
```javascript
// Example: Generate a warrior character
const warrior = await characterGenerator.generateCharacter({
    characterClass: 'warrior',
    level: 5,
    equipment: ['sword', 'shield', 'armor'],
    style: 'medieval'
});
```

**Available Classes:**
- Warrior, Mage, Ranger, Paladin
- Rogue, Druid, Necromancer, Summoner
- Archer, Knight, Barbarian, Assassin
- Cleric, Monk, Sorcerer

### **Monster Generators**
```javascript
// Example: Generate a dragon
const dragon = await monsterGenerator.generateMonster({
    monsterType: 'dragon',
    size: 'large',
    element: 'fire',
    age: 'ancient'
});
```

**Monster Types:**
- Dragons, Giants, Demons, Undead
- Beasts, Insects, Constructs, Elementals

### **Item Generators**
```javascript
// Example: Generate a magical sword
const sword = await weaponGenerator.generateWeapon({
    weaponType: 'sword',
    material: 'mithril',
    enchantment: 'fire_damage',
    quality: 'legendary'
});
```

**Item Categories:**
- Weapons (swords, axes, bows, staves)
- Armor (helmets, chest plates, boots, gloves)
- Tools (hammers, picks, fishing rods)
- Consumables (potions, scrolls, food)

## 🎛️ **Parameter Controls**

### **Basic Parameters**
- **Size**: Pixel dimensions (16x16 to 512x512)
- **Style**: Art style (pixel, cartoon, realistic)
- **Theme**: Color scheme (medieval, fantasy, sci-fi)
- **Quality**: Detail level (low, medium, high)

### **Advanced Parameters**
- **Seed**: Random generation seed for reproducibility
- **Variation**: Randomness level (0-100)
- **Complexity**: Detail complexity (simple, moderate, complex)
- **Palette**: Custom color schemes

## 🔄 **Generation Workflow**

### **Step 1: Select Generator**
1. Open TPT Asset Editor
2. Navigate to "Sprites" section
3. Choose appropriate generator category
4. Select specific generator type

### **Step 2: Configure Parameters**
1. Adjust basic settings (size, style, theme)
2. Fine-tune advanced parameters
3. Preview changes in real-time
4. Save favorite configurations as presets

### **Step 3: Generate and Refine**
1. Click "Generate" to create initial asset
2. Use parameter sliders for adjustments
3. Experiment with different variations
4. Regenerate until satisfied

### **Step 4: Export**
1. Choose export format (PNG, JPEG, WebP)
2. Set output quality and compression
3. Select destination folder
4. Add metadata and tags

## 🎯 **Best Practices**

### **Consistent Styling**
```javascript
// Use consistent parameters across similar assets
const characterParams = {
    style: 'pixel',
    theme: 'fantasy',
    palette: 'warm',
    quality: 'high'
};

const warrior = await generateCharacter({...characterParams, class: 'warrior'});
const mage = await generateCharacter({...characterParams, class: 'mage'});
```

### **Batch Generation**
```javascript
// Generate multiple variations
const variations = [];
for (let i = 0; i < 10; i++) {
    variations.push(await generateCharacter({
        ...baseParams,
        seed: i, // Different seed for each variation
        variation: 30 + i * 5 // Increasing variation
    }));
}
```

### **Quality Optimization**
- **Resolution**: Match your game's pixel density
- **File Size**: Balance quality vs. performance
- **Color Depth**: Use appropriate color palettes
- **Transparency**: Proper alpha channel handling

## 🛠️ **Advanced Techniques**

### **Custom Palettes**
```javascript
const customPalette = {
    primary: '#4A90E2',
    secondary: '#F5A623',
    accent: '#E94B3C',
    neutral: '#7ED321'
};

const asset = await generateWithPalette(generator, {
    ...params,
    customPalette: customPalette
});
```

### **Procedural Variations**
```javascript
// Create asset families with shared traits
const familyParams = {
    baseSeed: 12345,
    familyTraits: ['pointed_ears', 'glowing_eyes'],
    variationRange: 20
};

const family = await generateCharacterFamily(familyParams);
```

### **Animation Preparation**
```javascript
// Generate animation frames
const frames = [];
const baseParams = { character: 'warrior', action: 'walk' };

for (let frame = 0; frame < 8; frame++) {
    frames.push(await generateCharacter({
        ...baseParams,
        animationFrame: frame,
        totalFrames: 8
    }));
}
```

## 🔍 **Troubleshooting**

### **Common Issues**

**❌ Asset looks too noisy/random:**
- Reduce variation parameter
- Use lower complexity setting
- Try different seed values

**❌ Colors don't match game theme:**
- Adjust theme parameter
- Use custom color palette
- Check color harmony settings

**❌ Asset too large/small:**
- Adjust size parameters
- Check pixel density settings
- Verify export resolution

**❌ Generation is slow:**
- Reduce complexity/quality settings
- Use smaller dimensions
- Enable background processing

### **Performance Tips**
- Generate at lower quality for prototyping
- Use batch processing for multiple assets
- Cache frequently used parameter sets
- Monitor memory usage during large generations

## 📚 **Next Steps**

Now that you understand sprite generation basics:

1. **[Character Creation Guide](character-creation.md)** - Detailed character generation
2. **[Environment Design](environment-design.md)** - Creating game worlds
3. **[Animation Systems](animation-guide.md)** - Making assets move
4. **[Batch Processing](batch-processing.md)** - Efficient workflows
5. **[Export Optimization](export-guide.md)** - Preparing for game engines

## 🎮 **Integration Examples**

### **Unity Integration**
```csharp
// Load TPT-generated sprite
public class TPTSpriteLoader : MonoBehaviour {
    public async Task<Sprite> LoadTPTSprite(string assetPath) {
        var texture = await LoadTextureAsync(assetPath);
        return Sprite.Create(texture, new Rect(0, 0, texture.width, texture.height), Vector2.one * 0.5f);
    }
}
```

### **Godot Integration**
```gdscript
# Use TPT-generated sprites in Godot
func load_tpt_sprite(asset_path: String) -> Sprite:
    var texture = load(asset_path) as Texture
    var sprite = Sprite.new()
    sprite.texture = texture
    return sprite
```

Remember: Experiment freely! The beauty of procedural generation is that you can always create something new and unexpected. 🎨✨
