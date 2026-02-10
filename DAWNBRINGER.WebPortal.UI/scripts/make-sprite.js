const sharp = require("sharp");
const path = require("path");

async function run() {
    const dir = path.join(__dirname, "..", "public", "loading", "throb");
    const frames = [];
    for (let i = 0; i < 32; i++) {
        frames.push(path.join(dir, "throb" + String(i).padStart(4, "0") + ".png"));
    }

    const meta = await sharp(frames[0]).metadata();
    const w = meta.width;
    const h = meta.height;
    console.log("Frame size: " + w + "x" + h);

    const composites = frames.map((f, i) => ({
        input: f,
        left: i * w,
        top: 0,
    }));

    await sharp({
        create: {
            width: w * 32,
            height: h,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    })
        .composite(composites)
        .png()
        .toFile(path.join(__dirname, "..", "public", "loading", "throb-sprite.png"));

    console.log("Sprite sheet created: " + (w * 32) + "x" + h);
}

run().catch(console.error);
