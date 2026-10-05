const router = require("express").Router();
const MealPlan = require("../models/MealPlan");
const User = require("../models/User");

router.get("/current", async (req, res) => {
    try {
        const { userId, type } = req.query;

        // 1. HA ADMIN KÉRI, VAGY NINCS USERID (KIJELENTKEZVE): Mindig az admin tervet adjuk
        if (type === "admin" || !userId || userId === "null" || userId === "undefined") {
            const adminPlan = await MealPlan.findOne({ isAdminPlan: true, isActive: true })
                .sort({ weekStart: -1, createdAt: -1 })
                .populate("items.recipeId");
            return res.status(200).json(adminPlan);
        }

        // 2. HA BEJELENTKEZETT USER KÉRI:
        // Először megnézzük, van-e már saját aktív terve (amit lementett/másolt)
        let plan = await MealPlan.findOne({
            owner: userId,
            isAdminPlan: false,
            isActive: true
        }).populate("items.recipeId");

        // 3. FALLBACK: Ha a bejelentkezett usernek MÉG NINCS saját terve, 
        // akkor is adjuk vissza az ADMIN tervet, hogy legyen mit látnia/másolnia!
        if (!plan) {
            const adminPlan = await MealPlan.findOne({ isAdminPlan: true, isActive: true })
                .sort({ weekStart: -1, createdAt: -1 })
                const user = await User.findById(userId);

            plan = new MealPlan({
                title: `${user?.username || "Saját"} konyhája`,
                owner: userId,
                isAdminPlan: false,
                isPublic: false,
                isActive: true,
                basedOn: adminPlan ? adminPlan._id : null,
                weekStart: adminPlan ? adminPlan.weekStart : new Date(),
                weekEnd: adminPlan ? adminPlan.weekEnd : new Date(),
                items: adminPlan ? adminPlan.items.map(item => ({
                    day: item.day,
                    slot: item.slot,
                    recipeId: item.recipeId
                })) : []
            });

            await plan.save();
            // Újra populate-oljuk, hogy az elemek receptjei visszatérjenek
            plan = await MealPlan.findById(plan._id).populate("items.recipeId");
        }
               
      

        return res.status(200).json(plan);

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

router.get ("/", async (req, res) => {
    try{
        const {userId, type} = req.query;
        let query = {};

        if (type === "admin") {
            query = { isAdminPlan: true};

        }
            else if(userId && userId !=="null") {
                query = {owner: userId, isAdminPlan: false};
            }
            else {
                query= { isPublic: true};
            }

            const plans = await MealPlan.find(query)
            .sort({ weekStart: -1, createdAt: -1})
            .populate("items.recipeId");

            res.status(200).json(plans);
        }

    
    catch(err){
        console.error("❌ /mealplans error:", err);
        res.status(500).json(err);
    }
});
router.post("/", async(req, res) => {
    try {
        // Megnézzük a query-ben ÉS a body-ban is a biztonság kedvéért
        const userId = req.query.userId || req.body.userId; 
        const user = await User.findById(userId);

        if (!user) return res.status(404).json("User nem található");

        if (user.role === "admin") {
            req.body.isPublic = true;
            req.body.isAdminPlan = true;
            req.body.owner = userId;
        } else {
            req.body.isPublic = false;
            req.body.isAdminPlan = false;
            req.body.owner = userId;
        }

        // Deaktiváljuk a régit
        const filter = (user.role === "admin") ? { isAdminPlan: true } : { owner: userId, isAdminPlan: false };
        await MealPlan.updateMany(filter, { $set: { isActive: false } });

        const newPlan = new MealPlan(req.body);
        const saved = await newPlan.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json(err);
    }
});
router.post("/:id/items", async (req,res)=> {
    try {
        const { day = "", slot = "", recipeId} = req.body;

        const updated = await MealPlan.findByIdAndUpdate(
            req.params.id,
            {$push: { items: { day, slot, recipeId}}},
            { new: true}
        ).populate("items.recipeId");
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json(err);
    }
});


router.delete("/:id/items/:itemId", async (req, res) => {
try{
    const updated = await MealPlan.findByIdAndUpdate(
        req.params.id,
        { $pull:{ items: {_id: req.params.itemId }}},
        {new: true}
    ).populate("items.recipeId");
    res.status(200).json(updated);
} catch(err) {
    res.status(500).json(err);
}
});


// router.delete("/:id", async (req, res) => {
//     try{
//         const updated = await MealPlan.findByIdAndDelete(
//             req.params.id);
//             const nextPlan = await MealPlan.findOne({isAdminPlan: true, isActive: true}).populate("items.recipeId");
//         res.status(200).json(nextPlan || {});
//     } catch(err) {
//         res.status(500).json(err);
//     }
//     });


// ✅ Így kellene módosítani a backend feltételt:
router.delete("/:id", async (req, res) => {
    try {
      const mealPlan = await MealPlan.findById(req.params.id);
      if (!mealPlan) return res.status(404).json("A terv nem található");
  
      // Ha admin típusú, de az aktív státuszú vagy csak simán ellenőrizni akarod a felhasználót:
      // (Ha nincs még beépítve komoly auth middleware, de az id-t ellenőrzöd, vagy engedni akarod az adminnak a múltbeli törlést):
      
      // Ha teljesen fel akarod szabadítani a törlést az admin terveknél:
      await MealPlan.findByIdAndDelete(req.params.id);
      return res.status(200).json("Menü sikeresen törölve");
  
    } catch (err) {
      res.status(500).json(err);
    }
  });


router.put("/:id/items/:itemId", async (req, res) => {
    try {
        const updated = await MealPlan.findOneAndUpdate(
            { _id: req.params.id, "items._id": req.params.itemId },
            { $set: { "items.$.day": req.body.day } },
            { new: true }
        ).populate("items.recipeId");
        
        if (!updated) {
            return res.status(404).json("A terv vagy a tétel nem található.");
        }
        
        res.status(200).json(updated);
    } catch (err) {
        console.error("Hiba a nap frissítésekor:", err);
        res.status(500).json(err);
    }
});

router.put("/current/note", async (req,res) => {

    try {
        const  { userId } = req.query;
        const user = await User.findById(userId);

        let filter = { isActive: true};

        if(user && user.role === "admin") {
            filter.isAdminPlan=true;
        } else {
            filter.owner= userId;
            filter.isAdminPlan =false;
        }


        const updated = await MealPlan.findOneAndUpdate(
            filter,
            { $set: req.body},
            { new: true}
        ).populate("items.recipeId");
        res.status(200).json(updated);
    } catch(err) {
        res.status(500).json(err);
    }
});

router.put("/:id/activate", async (req, res) => {
    try{
  // 1. Megkeressük a tervet, amit aktiválni akarunk, hogy tudjuk, kié
  const targetPlan = await MealPlan.findById(req.params.id);
  if (!targetPlan) return res.status(404).json("Terv nem található");

  // 2. Csak az ugyanolyan típusú terveket deaktiváljuk
  // Ha admin terv, akkor az összes isAdminPlan: true-t, ha useré, akkor az ő sajátjait
  const filter = targetPlan.isAdminPlan 
      ? { isAdminPlan: true } 
      : { owner: targetPlan.owner, isAdminPlan: false };

        await MealPlan.updateMany (filter, { $set: { isActive: false}});
        const updated = await MealPlan.findByIdAndUpdate (
            req.params.id, 
            { $set: { isActive: true}},
            { new: true}
        ).populate("items.recipeId");
        res.status(200).json(updated);
    } catch(err) {
        res.status(500).json(err);
    }
});
router.post("/copy", async (req, res) => {
    try {
        const { adminPlanId, userId } = req.body;

        // 1. Megkeressük az admin tervet
        const adminPlan = await MealPlan.findById(adminPlanId);
        const user= await User.findById(userId);
        
        // 2. Deaktiváljuk a user eddigi aktív tervét
        await MealPlan.updateMany(
            { owner: userId, isAdminPlan: false }, 
            { $set: { isActive: false } }
        );

        // 3. Létrehozzuk az új tervet az adminé alapján
        const newPlan = new MealPlan({
            title: `${user?.username || "Saját"} konyhája`,
            owner: userId,
            isAdminPlan: false,
            isPublic: false,
            isActive: true,
            basedOn: adminPlanId,
            weekStart: adminPlan.weekStart,
            weekEnd: adminPlan.weekEnd,
            noteTitle: adminPlan.noteTitle,
            noteText: "",
            // Az items tömböt is le kell másolnunk (fontos, hogy új ID-kat kapjanak az itemek)
            items: adminPlan.items.map(item => ({
                day: item.day,
                slot: item.slot,
                recipeId: item.recipeId
            }))
        });

        const saved = await newPlan.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;