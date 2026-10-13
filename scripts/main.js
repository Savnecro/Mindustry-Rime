// Mindustry uses Rhino: use Packages, not Nashorn/GraalJS Java.type().
// Register BEFORE ContentLoader.init() so bullets receive normal initialization.
(function () {
    'use strict';

    const CT = Packages.mindustry.ctype.ContentType;
    const ModContentLoadEvent = Packages.mindustry.game.EventType.ModContentLoadEvent;
    const Bullets = Packages.mindustry.entities.bullet;
    const BulletType = Bullets.BulletType;
    const BasicBulletType = Bullets.BasicBulletType;
    const ArtilleryBulletType = Bullets.ArtilleryBulletType;
    const FlakBulletType = Bullets.FlakBulletType;
    const ShrapnelBulletType = Bullets.ShrapnelBulletType;
    const ContinuousFlameBulletType = Bullets.ContinuousFlameBulletType;
    const RailBulletType = Bullets.RailBulletType;
    const Colors = Packages.arc.graphics.Color;
    const Effect = Packages.mindustry.entities.Effect;
    const Draw = Packages.arc.graphics.g2d.Draw;
    const Fill = Packages.arc.graphics.g2d.Fill;
    const IceBlocks = Packages.mindustry.content.Blocks;
    const IceStatuses = Packages.mindustry.content.StatusEffects;
    const IceFx = Packages.mindustry.content.Fx;
    const IceVars = Packages.mindustry.Vars;

    const front = Colors.valueOf('d9f6ff');
    const back = Colors.valueOf('6fb9ff');
    const hit = Colors.valueOf('9bdfff');
    const rimeFront = Colors.valueOf('f0fcff');
    const blueFlame = new Effect(22, e => {
        Draw.color(back, front, e.fin());
        Fill.circle(e.x, e.y, 1.4 + 3.2 * e.fout());
        Draw.reset();
    });

    function freeze(bullet, seconds) {
        bullet.status = IceStatuses.freezing;
        bullet.statusDuration = seconds * 60;
        bullet.hitColor = hit;
        bullet.trailColor = back;
        return bullet;
    }
    // ShrapnelBulletType and RailBulletType do NOT: assign those separately.
    function tint(bullet) {
        bullet.frontColor = front;
        bullet.backColor = back;
        bullet.hitEffect = IceFx.hitBulletColor;
        bullet.despawnEffect = IceFx.hitBulletColor;
        return bullet;
    }
    function basic(speed, damage, lifetime, seconds, width, height) {
        const b = tint(freeze(new BasicBulletType(speed, damage), seconds));
        b.lifetime = lifetime;
        b.width = width;
        b.height = height;
        return b;
    }
    function artillery(speed, damage, lifetime, radius, splash, seconds) {
        const b = tint(freeze(new ArtilleryBulletType(speed, damage), seconds));
        b.lifetime = lifetime;
        b.splashDamageRadius = radius;
        b.splashDamage = splash;
        b.width = 12;
        b.height = 14;
        b.collidesAir = false;
        b.collidesTiles = false;
        b.despawnHit = true;
        b.knockback = 0.5;
        return b;
    }
    function splashRifle(speed, damage, lifetime, radius, splash, seconds) {
        const b = basic(speed, damage, lifetime, seconds, 7, 10);
        b.splashDamage = splash;
        b.splashDamageRadius = radius;
        b.despawnHit = true;
        return b;
    }
    function addFrags(parent, count, fragDamage, fragSpeed, fragLifetime, spread) {
        const child = basic(fragSpeed, fragDamage, fragLifetime, 2.5, 5, 8);
        child.ammoMultiplier = 1;
        child.keepVelocity = false;
        child.despawnEffect = IceFx.none;
        parent.fragBullet = child;
        parent.fragBullets = count;
        parent.fragSpread = 0;
        parent.fragRandomSpread = spread;
        parent.fragVelocityMin = 0.75;
        parent.fragVelocityMax = 1.05;
        parent.fragLifeMin = 0.75;
        parent.fragLifeMax = 1.0;
        parent.despawnHit = true;
        return parent;
    }
    // ContinuousFlameBulletType applies line damage every damageInterval ticks.
    // A single fired flame persists for lifetime ticks; damage is PER PULSE,
    // not per shot. Replace the built-in purple color gradient in place.
    function continuousFlame(damage, length, width, palette) {
        const bullet = new ContinuousFlameBulletType(damage);
        bullet.length = length;
        bullet.width = width;
        bullet.lifetime = 20;
        bullet.damageInterval = 5;
        bullet.pierceArmor = false;
        bullet.collidesAir = false;
        bullet.drawFlare = false;
        bullet.lightStroke = 22;
        for (let i = 0; i < 5; i++) {
            bullet.colors[i] = Colors.valueOf(palette[i]);
        }
        bullet.hitColor = Colors.valueOf(palette[3]);
        bullet.lightColor = bullet.hitColor;
        bullet.hitEffect = IceFx.hitFlameSmall;
        bullet.shootEffect = IceFx.shootSmallFlame;
        return bullet;
    }
    function logMessage(message) {
        print('[Rime ammo] ' + message);
    }

    Events.on(ModContentLoadEvent, function () {
        try {
            function requireItem(name) {
                const id = 'ice-expansion-rime-' + name;
                const result = IceVars.content.getByName(CT.item, id);
                if (result == null) throw new Error('Missing item ' + id + '; ammunition cannot load');
                return result;
            }
            const cryolite = requireItem('cryolite');
            const cryosteel = requireItem('cryosteel');
            const rimeAlloy = requireItem('rime-alloy');
            let count = 0;
            function put(turret, item, bullet, label) {
                if (turret == null || turret.ammoTypes == null) {
                    throw new Error('Missing or incompatible item turret: ' + label);
                }
                turret.ammoTypes.put(item, bullet);
                if (!turret.ammoTypes.containsKey(item)) {
                    throw new Error('Ammo registration did not persist for ' + label);
                }
                count++;
            }

            const duo = splashRifle(2.8, 3, 55, 27, 3, 3.2);
            duo.ammoMultiplier = 2;
            put(IceBlocks.duo, cryolite, duo, 'Duo/Cryolite');

            const scorch = freeze(continuousFlame(6, 60, 2.7, [
                '38699c99', '528ccee0', '79baf0dd', 'c5ebff', 'f1fdff'
            ]), 2.8);
            scorch.lifetime = 15;
            scorch.shootEffect = blueFlame;
            scorch.hitEffect = blueFlame;
            scorch.ammoMultiplier = 3;
            put(IceBlocks.scorch, cryolite, scorch, 'Scorch/Cryolite');

            const hail = artillery(3, 8, 80, 42, 26, 3.6);
            hail.ammoMultiplier = 2;
            put(IceBlocks.hail, cryolite, hail, 'Hail/Cryolite');

            // Vanilla Ripple ammunition remains unaffected.
            const ripple = artillery(3.0, 5, 83, 28.5, 20, 3.6);
            addFrags(ripple, 3, 4, 2.5, 27, 105);
            const frag = ripple.fragBullet;
            frag.sprite = ripple.sprite;
            frag.width = ripple.width * 0.65;
            frag.height = ripple.height * 0.65;
            frag.frontColor = ripple.frontColor;
            frag.backColor = ripple.backColor;
            frag.trailColor = ripple.trailColor;
            frag.trailLength = 8;
            frag.trailWidth = 1.5;
            frag.splashDamage = 8;
            frag.splashDamageRadius = 16;
            frag.despawnHit = true;
            frag.collidesAir = false;
            frag.collidesGround = true;
            frag.status = IceStatuses.freezing;
            frag.statusDuration = 180;
            ripple.ammoMultiplier = 3;
            put(IceBlocks.ripple, cryolite, ripple, 'Ripple/Cryolite');

            const salvo = basic(3.5, 22, 55, 3.0, 9, 13);
            addFrags(salvo, 7, 7, 3, 30, 145);
            salvo.ammoMultiplier = 3;
            put(IceBlocks.salvo, cryosteel, salvo, 'Salvo/Cryosteel');

            const cyclone = tint(freeze(new FlakBulletType(4, 9), 3.0));
            cyclone.lifetime = 48;
            cyclone.width = 10;
            cyclone.height = 13;
            cyclone.splashDamage = 35;
            cyclone.splashDamageRadius = 35;
            cyclone.collidesGround = true;
            cyclone.explodeRange = 20;
            addFrags(cyclone, 8, 9, 3, 36, 170);
            cyclone.ammoMultiplier = 3;
            put(IceBlocks.cyclone, cryosteel, cyclone, 'Cyclone/Cryosteel');

            const spectreFrag = basic(7.6, 48, 37, 3.0, 15, 21);
            addFrags(spectreFrag, 10, 11, 3.2, 32, 160);
            spectreFrag.ammoMultiplier = 2;
            put(IceBlocks.spectre, cryosteel, spectreFrag, 'Spectre/Cryosteel');

            const fuse = freeze(new ShrapnelBulletType(), 4.5);
            fuse.length = 108;
            fuse.damage = 145;
            fuse.width = 21;
            fuse.fromColor = rimeFront;
            fuse.toColor = back;
            fuse.pierce = true;
            fuse.pierceCap = -1;
            fuse.armorMultiplier = 0.8;
            fuse.ammoMultiplier = 2;
            put(IceBlocks.fuse, rimeAlloy, fuse, 'Fuse/Rime Alloy');

            const foreshadow = freeze(new RailBulletType(), 5.0);
            foreshadow.length = 500;
            foreshadow.damage = 1200;
            foreshadow.buildingDamageMultiplier = 0.2;
            foreshadow.pierce = true;
            foreshadow.pierceBuilding = true;
            foreshadow.pierceCap = 16;
            foreshadow.pierceDamageFactor = 0.65;
            foreshadow.hitShake = 6;
            foreshadow.ammoMultiplier = 1;
            foreshadow.shootEffect = IceFx.instShoot;
            foreshadow.hitEffect = IceFx.instHit;
            foreshadow.pierceEffect = IceFx.railHit;
            foreshadow.smokeEffect = IceFx.smokeCloud;
            foreshadow.pointEffect = IceFx.instTrail;
            foreshadow.pointEffectSpace = 20;
            foreshadow.despawnEffect = IceFx.instBomb;
            put(IceBlocks.foreshadow, rimeAlloy, foreshadow, 'Foreshadow/Rime Alloy');

            const spectrePierce = basic(8.2, 100, 36, 4.2, 16, 23);
            spectrePierce.frontColor = rimeFront;
            spectrePierce.pierce = true;
            spectrePierce.pierceBuilding = true;
            spectrePierce.pierceCap = 7;
            spectrePierce.pierceDamageFactor = 0.55;
            spectrePierce.ammoMultiplier = 1;
            put(IceBlocks.spectre, rimeAlloy, spectrePierce, 'Spectre/Rime Alloy');

            logMessage('registered ' + count + '/10 vanilla turret ammo extensions.');
        } catch (err) {
            logMessage('ERROR registering vanilla turret ammo: ' + err);
            throw err;
        }
    });
})();
