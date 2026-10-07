const router = require("express").Router();
const Recipe = require("../models/Recipe");
const User = require("../models/User");


//CREATE RECIPES
router.post("/", async (req, res) => {
    try {
        // const newRecipe = await new Recipe(req.body).save();
        // res.status(200).json(newRecipe);
      const user = await User.findById(req.body.createdBy);

    if (!user) {
      return res.status(404).json("Felhasználó nem található.")
    }
    const newRecipe = new Recipe({
      title: req.body.title,
      mealType: req.body.mealType,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      tags: req.body.tags,
      prepTime: req.body.prepTime,
      servings: req.body.servings,
      photo: req.body.photo,
      createdBy: user._id,
      isPublic: user.role === "admin",
    });
    const savedRecipe = await newRecipe.save();
    res.status(200).json(savedRecipe);

    } catch (err) {
        res.status(500).json(err);
    }
});

// GET ALL EXTRA
// router.get("/", async (req, res) => {
//     const { mealType, tag, q } = req.query;
  
//     try {
//       const filter = {};
  
//       if (mealType) filter.mealType = mealType;
//       if (tag) filter.tags = { $in: [tag] };
//       if (q) filter.title = { $regex: q, $options: "i" };
  
//       const recipes = await Recipe.find(filter).sort({ createdAt: -1 });
//       res.status(200).json(recipes);
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   });

//GET ALL simple
router.get("/", async (req, res) => {
    try {
      // const recipes = await Recipe.find();
      // res.status(200).json(recipes);
      const userId = req.query.userId;

      if(!userId){
        const publicRecipes = await Recipe.find({isPublic: true}).sort({createdAt: -1});
        return res.status(200).json(publicRecipes);
      }

      const user = await User.findById(userId);
      if (!user) {
        const publicRecipes = await Recipe.find({isPublic: true}).sort({createdAt: -1});
        return res.status(200).json(publicRecipes);
      }

      if (user.role === "admin") {
        if (req.query.scope ==="public") {
          const publicRecipes = await Recipe.find({isPublic: true}).sort({createdAt: -1});
          return res.status(200).json(publicRecipes);
        }
        const allRecipes = await Recipe.find().sort({createdAt: -1});
        return res.status(200).json(allRecipes);
      }

      const visibleRecipes = await Recipe.find({
        $or: [
          {isPublic: true},
          {createdBy: user._id }
        ]
      }).sort({ createdAt: -1});
      res.status(200).json(visibleRecipes);
    } catch (err) {
      res.status(500).json(err);
    }
  });

// GET ONE (single recipe oldalhoz)
router.get("/:id", async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      res.status(200).json(recipe);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  //EDIT RECIPES
  router.put("/:id", async (req, res) => {
    try {
      const updated = await Recipe.findByIdAndUpdate (
        req.params.id,
        { $set: req.body },
        { new: true}
      );
      res.status(200).json(updated);
    } catch(err){
      res.status(500).json(err);
    }
  })

  //DELETE RECIPES
  router.delete("/:id", async(req,res) => {
    try{
      const recipe = await Recipe.findById(req.params.id);

      if(!recipe){
        return res.status(404).json("A recept nem található");
      }
      const userId = req.body?.userId;
      const user = await User.findById(userId);
      if (recipe.createdBy.toString() === userId || user?.role ==="admin") {
        await recipe.deleteOne();
        return res.status(200).json("recept sikeresen törölve");
      } else {
        return res.status(403).json("csak a saját receptedet törölheted")
      }

    }catch(err){
      res.status(500).json(err);
    }
  })

  
  router.get("/sitemap.xml", async (req, res) => {
    try {
        const recipes = await Recipe.find({ isPublic: true }, '_id updatedAt');

        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Főoldal
        sitemap += '  <url>\n';
        sitemap += '    <loc>https://milegyenavacsora.hu/</loc>\n';
        sitemap += '    <changefreq>daily</changefreq>\n';
        sitemap += '    <priority>1.0</priority>\n';
        sitemap += '  </url>\n';

        // Nyilvános receptek dinamikus listája
        recipes.forEach(recipe => {
            sitemap += '  <url>\n';
            sitemap += `    <loc>https://milegyenavacsora.hu/recipe/${recipe._id}</loc>\n`;
            if (recipe.updatedAt) {
                sitemap += `    <lastmod>${new Date(recipe.updatedAt).toISOString()}</lastmod>\n`;
            }
            sitemap += '    <changefreq>weekly</changefreq>\n';
            sitemap += '    <priority>0.8</priority>\n';
            sitemap += '  </url>\n';
        });

        sitemap += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (err) {
        console.error('Hiba a sitemap generálásakor:', err);
        res.status(500).send('Szerver hiba');
    }
});

  module.exports = router;