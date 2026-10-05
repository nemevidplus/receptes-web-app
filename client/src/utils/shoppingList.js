// client/src/utils/shoppingList.js

export const generateShoppingListFromItems = (planItems, selectedItems) => {
    const ingredientsMap = {};
    const itemsToProcess = planItems?.filter((item) => selectedItems.includes(item._id));
  
    itemsToProcess?.forEach((item) => {
      const recipeIngs = item.recipeId?.ingredients || [];
  
      recipeIngs.forEach((ing) => {
        if (!ing) return;
  
        let name = "";
        let amount = 0;
        let unit = "";
        let rawText = "";
  
        // 1. Ha a hozzávaló string (pl. "800 g csirke" vagy "tonhalkonzerv")
        if (typeof ing === "string") {
          rawText = ing.trim();
          const match = rawText.match(/^([\d.,]+)?\s*([a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]+)?\s*(.*)$/);
  
          if (match) {
            let amountStr = match[1];
            unit = match[2] ? match[2].toLowerCase().trim() : "";
            name = match[3] ? match[3].toLowerCase().trim() : "";
  
            if (!name && unit) {
              name = unit;
              unit = "";
            }
  
            amount = amountStr ? parseFloat(amountStr.replace(",", ".")) : 0;
          } else {
            name = rawText;
          }
        }
        // 2. Ha a hozzávaló objektum (pl. {name: "csirke", amount: 800, unit: "g"})
        else if (typeof ing === "object") {
          name = ing.name ? ing.name.toLowerCase().trim() : "";
          amount = parseFloat(ing.amount) || 0;
          unit = ing.unit ? ing.unit.toLowerCase().trim() : "";
        }
  
        if (!name) return;
  
        // Egyedi kulcs az összevonáshoz (mértékegység + név alapján)
        const key = `${unit}_${name}`;
  
        if (ingredientsMap[key]) {
          if (amount > 0) {
            ingredientsMap[key].amount += amount;
          }
        } else {
          ingredientsMap[key] = {
            name,
            amount,
            unit,
          };
        }
      });
    });
  
    // Visszaalakítjuk tömbbé a listát a megjelenítéshez és az e-mail küldéshez
    return Object.values(ingredientsMap).map((item) => {
      const amountStr = item.amount > 0 ? item.amount : "";
      const unitStr = item.unit ? ` ${item.unit}` : "";
      
      return {
        name: item.name,
        amount: amountStr,
        unit: item.unit,
        displayString: `${amountStr}${unitStr} ${item.name}`.trim(),
      };
    });
  };