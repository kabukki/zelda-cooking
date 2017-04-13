'use strict';

/*
 * This file contains the list of all recipes
 * known so far.
 *
 * The representation of a recipe inside every
 * sub-function is as follows:
 *   A				->	Unique type A (child)
 *   [A]			->	Generic type A (parent)
 *   [A - B - ...]	->	Parent type A excluding B
 *   A|B 			->	Type A or B
 *
 * The order of the checks matter a lot, whence this
 * representation to understand every one of them.
 * Also, no 'else if' is used since every 'if' returns
 * from the function if it is evaluated successfully.
 *
 * A few rules apply when checking for a recipe:
 * 1. The recipes w/ the most ingredients should be
 *    checked first or it could create false positives
 *    e.g. wheat, then wheat + butter.
 *         the first check would return, though the
 *         second one should be the one returned.
 * 2. When checking for only 1 type, this type should
 *    never appear again in subsequent checks, unless
 *    if we are in a child type check.
 * 3. Try to align the ingredients common to successive
 *    checks for more readability.
 */



/*
 * Returns the name of the dish, knowing that
 * it contains at least the 'monster' type.
 */
function monsterRecipes(type) {
	////// Extract
	if (type.has("extract")) {
		// Extract + Wheat + Sugar + Butter
		if (type.has("wheat") && type.has("sugar") && type.has("butter"))
			return "Monster Pie";
		// Extract + Wheat + Milk + Butter
		if (type.has("wheat") && type.has("milk") && type.has("butter"))
			return "Monster Soup";
		// Extract + Rice + Spice
		if (type.has("rice") &&type.has("spice"))
			return "Monster Curry";		
		// Extract + Rice + Salt
		if (type.has("rice") &&type.has("salt"))
			return "Monster Rice Balls";		
		// Extract + [Seafood] + [Meat]
		if (type.has("seafood") && type.has("meat"))
			return "Monster Stew";
	}
	// [Monster] + [Critter] -- Only these 2 types
	if (type.has("critter"))
		return "Elixir";
	return "Dubious Food";
}

/*
 * Returns the name of the dish, knowing that
 * it contains at least the 'seafood' type.
 */
function seafoodRecipes(type) {
	// [Seafood] + Milk + Salt + [Herb|Vegetable]
	if (type.has("milk") && type.has("salt") && (type.has("herb") || type.has("vegetable")))
		return "Creamy Seafood Soup";
	// [Seafood] + Wheat + Salt + Butter
	if (type.has("wheat") && type.has("salt") && type.has("butter"))
		return "Fish Pie";
	// [Seafood] + [Meat>[Gourmet]]
	if (type.has("meat") && type.has("gourmet"))
		return "Gourmet Meat and Seafood Fry";
	// [Seafood] + [Meat>[Prime]]
	if (type.has("meat") && type.has("prime"))
		return "Prime Meat and Seafood Fry";
	// [Seafood] + [Meat(>[Regular])]
	if (type.has("meat"))
		return "Meat and Seafood Fry";
	// [Seafood] + Honey
	if (type.has("honey"))
		return "Glazed Seafood";
	// [Seafood] + Pepper
	if (type.has("pepper"))
		return "Pepper Seafood";
	////// Porgy
	if (type.has("porgy")) {
		// Porgy + Rice + Snail + Butter + Salt
		if (type.has("rice") && type.has("snail") && type.has("butter") && type.has("salt"))
			return "Seafood Paella";
		// Porgy + Butter + Wheat
		if (type.has("butter") && type.has("wheat"))
			return "Porgy Meuniere";
		// Porgy + Rice + Spice
		if (type.has("rice") && type.has("spice"))
			return "Seafood Curry";
		// Porgy + Rice + Salt
		if (type.has("rice") && type.has("salt"))
			return "Seafood Fried Rice";
	}
	////// Salmon
	if (type.has("salmon")) {
		// Salmon + Rice + Butter + Salt
		if (type.has("rice") && type.has("butter") && type.has("salt"))
			return "Salmon Risotto";
		// Salmon + Butter + Wheat
		if (type.has("butter") && type.has("wheat"))
			return "Salmon Meuniere";
	}
	////// Snail
	if (type.has("snail")) {
		// Snail + Milk + Wheat + Butter
		if (type.has("milk") && type.has("wheat") && type.has("butter"))
			return "Clam Chowder";
		// Snail + Rice + Spice
		if (type.has("rice") && type.has("spice"))
			return "Seafood Curry";
		// Snail + Rice + Salt
		if (type.has("rice") && type.has("salt"))
			return "Seafood Fried Rice";
	}
	// [Seafood - Porgy - Salmon - Snail] + Butter + Wheat
	if (type.has("butter") && type.has("wheat"))
		return "Seafood Meuniere";
	////// Fish
	if (type.has("fish")) {
		// Fish + Mushroom
		if (type.has("mushroom"))
			return "Fish and Mushroom Skewer";
		// Fish + Salt
		if (type.has("salt"))
			return "Salt-Grilled Fish";
		// Fish + Rice
		if (type.has("rice"))
			return "Seafood Rice Balls";
		// Fish
		else
			return "Fish skewer";
	}
	////// Crab
	if (type.has("crab")) {
		// Crab + Rice  + Butter + Salt
		if (type.has("rice") && type.has("butter") && type.has("salt"))
			return "Crab Risotto";
		// Crab + Rice  + Egg + Salt
		if (type.has("rice") && type.has("egg") && type.has("salt"))
			return "Crab Omelet with Rice";
		// Crab + Spice
		if (type.has("spice"))
			return "Crab Stir-Fry";
		// Crab + Salt
		if (type.has("salt"))
			return "Salt-Grilled Crab";
	}
	// [Seafood] + Rice
	if (type.has("rice"))
		return "Seafood Rice Balls";
	return "Seafood Skewer";
}

/*
 * Returns the name of the dish, knowing that
 * it contains at least the 'fruit' type.
 */
function fruitRecipes(type) {
	// [Fruit] + Mushroom
	if (type.has("mushroom"))
		return "Fruit and Mushroom Mix";
	////// Melon
	if (type.has("melon")) {
		// Melon + Voltfruit + [Vegetable]
		if (type.has("voltfruit") && type.has("vegetable"))
			return "Creamy Heart Soup";
	}
	// [Fruit] + [Herb]|[Vegetable]
	if (type.has("herb") || type.has("vegetable"))
		return "Steamed Fruit";
	////// Apple
	if (type.has("apple")) {
		// Apple + Wheat + Sugar + Butter
		if (type.has("wheat") && type.has("sugar") && type.has("butter"))
			return "Apple Pie";
		// Apple + Wheat + Sugar
		if (type.has("wheat") && type.has("sugar"))
			return "Fruitcake";
		// Apple + Butter
		if (type.has("butter"))
			return "Hot Buttered Apple";
		// Apple + Honey
		if (type.has("honey"))
			return "Honeyed Apple";
	}
	// [Fruit - Apple] + Wheat + Sugar + Butter
	if (type.has("wheat") && type.has("sugar") && type.has("butter"))
		return "Fruit Pie";
	// [Fruit - Apple] + Honey
	if (type.has("honey"))
		return "Honeyed Fruits";
	////// Wildberry
	if (type.has("wildberry")) {
		// Wildberry + Wheat + Sugar + Milk + Egg
		if (type.has("wheat") && type.has("sugar") && type.has("milk") && type.has("egg"))
			return "Wildberry Crepe";
		// Wildberry + Wheat + Sugar
		if (type.has("wheat") && type.has("sugar"))
			return "Fruitcake";
	}
	////// Peppers
	if (type.has("pepper")) {
		// Peppers + [Meat]
		if (type.has("meat"))
			return "Pepper Steak";
		// Peppers + [Seafood]
		if (type.has("seafood"))
			return "Pepper Seafood";
		// Peppers
		return "Sauteed Peppers";
	}
	// [Fruit]
	return "Simmered Fruit";
}

/*
 * Returns the name of the dish, knowing that
 * it contains at least the 'vegetable' type.
 */
function vegetableRecipes(type) {
	// [Vegetable] + Egg + Butter + Salt
	if (type.has("egg") && type.has("butter") && type.has("salt"))
		return "Vegetable Omelet";
	// [Vegetable] + [Meat] + Milk + Salt
	if (type.has("meat") && type.has("milk") && type.has("salt"))
		return "Creamy Meat Soup";
	// [Vegetable] + [Mushroom] + Milk + Salt
	if (type.has("mushroom") && type.has("milk") && type.has("salt"))
		return "Cream of Mushroom Soup";
	// [Vegetable] + [Mushroom]
	if (type.has("mushroom"))
		return "Steamed Mushrooms";
	// [Vegetable] + [Seafood] + Milk + Salt
	if (type.has("seafood") && type.has("milk") && type.has("salt"))
		return "Creamy Meat Soup";
	// [Vegetable] + [Seafood] 
	if (type.has("seafood"))
		return "Steamed Fish";
	// [Vegetable] + Honey
	if (type.has("honey"))
		return "Glazed Veggies";
	////// Pumpkin
	if (type.has("pumpkin")) {
		// Puumpkin + Wheat + Butter + Sugar
		if (type.has("wheat") && type.has("butter") && type.has("sugar"))
			return "Pumpkin Pie";
		// Pumpkin + Wheat + Butter + Milk
		if (type.has("wheat") && type.has("butter") && type.has("milk"))
			return "Punpkin Stew";
		// Pumpkin + Rice + Butter + Salt
		if (type.has("rice") && type.has("butter") && type.has("salt"))
			return "Vegetable Risotto";
		// Pumpkin + Milk + Salt
		if (type.has("milk") && type.has("salt"))
			return "Veggie Cream Soup";
		// Pumpkin + Rice + Spice
		if (type.has("rice") && type.has("spice"))
			return "Vegetable Curry";
		// Pumpkin + Meat
		if (type.has("meat"))
			return "Meat-Stuffed Pumpkin";
	}
	// [Vegetable - Pumpkin] + [Meat]
	if (type.has("meat"))
		return "Steamed Meat";
	////// Radish
	if (type.has("radish")) {
		// Radish + Melon + Voltfruit + Milk
		if (type.has("melon") && type.has("voltfruit") && type.has("milk"))
			return "Creamy Heart Soup";
	}
	// [Vegetable] + [Fruit] -- To avoid conflict with radish
	if (type.has("fruit"))
		return "Steamed Fruit";
	////// Carrot
	if (type.has("carrot")) {
		// Carrot + Wheat + Butter + Sugar
		if (type.has("wheat") && type.has("butter") && type.has("sugar"))
			return "Carrot Cake";
		// Carrot + Wheat + Butter + Milk
		if (type.has("wheat") && type.has("butter") && type.has("milk"))
			return "Carrot Stew";
		// Carrot + Rice + Butter + Salt
		if (type.has("rice") && type.has("butter")  && type.has("salt"))
			return "Vegetable Risotto";
		// Carrot + Milk + Salt
		if (type.has("milk") && type.has("salt"))
			return "Veggie Cream Soup";
		// Carrot + Rice + Spice
		if (type.has("rice") && type.has("spice"))
			return "Vegetable Curry";
	}
	// [Vegetable - Carrot - Pumpkin] + Milk + Salt
	if (type.has("milk") && type.has("salt"))
		return "Cream of Vegetable Soup";
	// [Vegetable] + Salt
	if (type.has("salt"))
		return "Salt-Grilled Greens";
	// [Vegetable] + Rice
	if (type.has("rice"))
		return "Veggie Rice Balls";
	// [Vegetable] + Spice
	if (type.has("spice"))
		return "Herb Saute";
	return "Fried Wild Greens";
}

/*
 * Returns the name of the dish, knowing that
 * it contains at least the 'herb' type.
 */
function herbRecipes(type) {
	// [Herb] + Egg + Butter + Salt
	if (type.has("egg") && type.has("butter") && type.has("salt"))
		return "Vegetable Omelet";
	// [Herb] + [Meat] + Milk + Salt
	if (type.has("meat") && type.has("milk") && type.has("salt"))
		return "Creamy Meat Soup";
	// [Herb] + [Mushroom] + Milk + Salt
	if (type.has("mushroom") && type.has("milk") && type.has("salt"))
		return "Cream of Mushroom Soup";
	// [Herb] + [Mushroom]
	if (type.has("mushroom"))
		return "Steamed Mushrooms";
	// [Herb] + [Seafood] + Milk + Salt
	if (type.has("seafood") && type.has("milk") && type.has("salt"))
		return "Creamy Meat Soup";
	// [Herb] + [Seafood] 
	if (type.has("seafood"))
		return "Steamed Fish";
	// [Herb] + Milk + Salt
	if (type.has("milk") && type.has("salt"))
		return "Cream of Vegetable Soup";
	// [Herb] + Honey
	if (type.has("honey"))
		return "Glazed Veggies";
	// [Herb - Pumpkin] + [Meat]
	if (type.has("meat"))
		return "Steamed Meat";
	// [Herb] + [Fruit] -- To avoid conflict with radish
	if (type.has("fruit"))
		return "Steamed Fruit";
	// [Herb] + Salt
	if (type.has("salt"))
		return "Salt-Grilled Greens";
	// [Herb] + Rice
	if (type.has("rice"))
		return "Veggie Rice Balls";
	// [Herb] + Spice
	if (type.has("spice"))
		return "Herb Saute";
	return "Fried Wild Greens";
}

/*
 * Returns the name of the dish, knowing that
 * it contains at least the 'meat' type.
 */
function meatRecipes(type) {
	// [Meat] + [Vegetable|Herb] + Milk + Salt
	if ((type.has("vegetable") || type.has("herb")) &&
		type.has("milk") && type.has("salt"))
		return "Creamy Meat Soup";
	// [Meat] + Pumpkin
	if (type.has("pumpkin"))
		return "Meat-Stuffed Pumpkin";
	// [Meat] + [Vegetable|Herb] + Milk + Salt
	if (type.has("vegetable") || type.has("herb"))
		return "Steamed Meat";
	// [Meat] + Wheat + Butter + Salt
	if (type.has("wheat") && type.has("butter") && type.has("salt"))
		return "Meat Pie";
	// [Meat] + [Mushroom]
	if (type.has("mushroom"))
		return "Meat and Mushroom Skewer";
	// [Meat] + [Seafood] + [Monster]
	if (type.has("seafood") && type.has("monster"))
		return "Monster Stew";
	////// [>Gourmet]
	if (type.has("gourmet")) {
		// [>Gourmet] + [Seafood]
		if (type.has("seafood"))
			return "Gourmet Meat and Seafood Fry";
		// [>Gourmet] + Wheat + Butter + Milk
		if (type.has("wheat") && type.has("butter") && type.has("milk"))
			return "Gourmet Meat Stew";
		// [>Gourmet] + Salt
		if (type.has("salt"))
			return "Salt-Grilled Gourmet Meat";
		////// [>Gourmet>[Venison]] 
		if (type.has("venison")) {
			// [>Gourmet>[Venison]] + Rice + Spice
			if (type.has("rice") && type.has("spice"))
				return "Gourmet Meat Curry";
		}
		////// [>Gourmet>[Poultry]] 
		if (type.has("poultry")) {
			// [>Gourmet>[Poultry]] + Rice + Egg + Butter
			if (type.has("rice") && type.has("egg") && type.has("butter"))
				return "Gourmet Poultry Pilaf";
			// [>Gourmet>[Poultry]] + Rice + Spice
			if (type.has("rice") && type.has("spice"))
				return "Gourmet Poultry Curry";
		}
		// [>Gourmet] + Rice + Salt
		if (type.has("rice") && type.has("salt"))
			return "Gourmet Meat and Rice Bowl";
		// [>Gourmet] + Spice
		if (type.has("spice"))
			return "Gourmet Spiced Meat Skewer";
	}
	////// [>Prime]
	if (type.has("prime")) {
		// [>Prime] + [Seafood]
		if (type.has("seafood"))
			return "Prime Meat and Seafood Fry";
		// [>Prime] + Wheat + Butter + Milk
		if (type.has("wheat") && type.has("butter") && type.has("milk"))
			return "Prime Meat Stew";
		// [>Prime] + Salt
		if (type.has("salt"))
			return "Salt-Grilled Prime Meat";
		////// [>Prime>[Venison]] 
		if (type.has("venison")) {
			// [>Prime>[Venison]] + Rice + Spice
			if (type.has("rice") && type.has("spice"))
				return "Prime Meat Curry";
		}
		////// [>Prime>[Poultry]] 
		if (type.has("poultry")) {
			// [>Prime>[Poultry]] + Rice + Egg + Butter
			if (type.has("rice") && type.has("egg") && type.has("butter"))
				return "Prime Poultry Pilaf";
			// [>Prime>[Poultry]] + Rice + Spice
			if (type.has("rice") && type.has("spice"))
				return "Prime Poultry Curry";
		}
		// [>Prime] + Rice + Salt
		if (type.has("rice") && type.has("salt"))
			return "Prime Meat and Rice Bowl";
		// [>Prime] + Spice
		if (type.has("spice"))
			return "Prime Spiced Meat Skewer";
	}
	////// [>Regular]
	if (type.has("regular")) {
		// [>Regular] + Wheat + Butter + Milk
		if (type.has("wheat") && type.has("butter") && type.has("milk"))
			return "Meat Stew";
		// [>Regular] + [Seafood]
		if (type.has("seafood"))
			return "Meat and Seafood Fry";
		// [>Regular] + Salt
		if (type.has("salt"))
			return "Salt-Grilled Meat";
		////// [>Regular>[Venison]] 
		if (type.has("venison")) {
			// [>Regular>[Venison]] + Rice + Spice
			if (type.has("rice") && type.has("spice"))
				return "Meat Curry";
		}
		////// [>Regular>[Poultry]] 
		if (type.has("poultry")) {
			// [>Regular>[Poultry]] + Rice + Egg + Butter
			if (type.has("rice") && type.has("egg") && type.has("butter"))
				return "Poultry Pilaf";
			// [>Regular>[Poultry]] + Rice + Spice
			if (type.has("rice") && type.has("spice"))
				return "Poultry Curry";
		}
		// [>Regular] + Rice + Salt
		if (type.has("rice") && type.has("salt"))
			return "Meat and Rice Bowl";
		// [>Regular] + Spice
		if (type.has("spice"))
			return "Spiced Meat Skewer";

	}
	// [Meat] + Rice + Salt
	if (type.has("rice"))
		return "Meaty Rice Balls";
	// [Meat] + Pepper
	if (type.has("pepper"))
		return "Pepper Steak";
	// [Meat] + Honey
	if (type.has("honey"))
		return "Glazed Meat";
	return "Meat Skewer";
}

/*
 * Returns the name of the dish, knowing that
 * it contains at least the 'mushroom' type.
 */
function mushroomRecipes(type) {
	// [Mushroom] + [Vegetable|Herb] + Milk + Salt
	if ((type.has("vegetable") || type.has("herb")) &&
		type.has("milk") && type.has("salt"))
		return "Cream of Mushroom Soup";	
	// [Mushroom] + [Vegetable|Herb]
	if (type.has("vegetable") || type.has("herb"))
		return "Steamed Mushrooms";	
	// [Mushroom] + Egg + Butter + Salt
	if (type.has("egg") && type.has("butter") && type.has("salt"))
		return "Mushroom Omelet";	
	// [Mushroom] + Rice + Butter + Salt
	if (type.has("rice") && type.has("butter") && type.has("salt"))
		return "Mushroom Risotto";	
	// [Mushroom] + Rice
	if (type.has("rice"))
		return "Mushroom Rice Balls";	
	// [Mushroom] + [Fruit]
	if (type.has("fruit"))
		return "Fruit and Mushroom Mix";	
	// [Mushroom] + [Meat]
	if (type.has("meat"))
		return "Meat and Mushroom Skewer";	
	// [Mushroom] + [Seafood>[Fish]]
	if (type.has("fish"))
		return "Fish and Mushroom Skewer";	
	// [Mushroom] + Spice
	if (type.has("spice"))
		return "Fragrant Mushroom Saute";	
	// [Mushroom] + Salt
	if (type.has("salt"))
		return "Salt-Grilled Mushrooms";	
	// [Mushroom] + Honey
	if (type.has("honey"))
		return "Glazed Mushroom";	
	return "Mushroom Skewer";
}

/*
 * Returns the name of the dish, knowing that
 * it contains at least the 'misc' type.
 */
function miscRecipes(type) {
	// Wood
	if (type.has("wood"))
		return "Rock-Hard Food";
	// Egg + Sugar + Milk + Wheat + Butter
	if (type.has("egg") && type.has("sugar") && type.has("milk") && type.has("wheat") && type.has("butter"))
		return "Plain Crepe";	
	// Egg + Sugar + Milk + Wheat + Honey
	if (type.has("egg") && type.has("sugar") && type.has("milk") && type.has("wheat") && type.has("honey"))
		return "Honey Crepe";	
	// Egg + Sugar + Milk + Wheat + Wildberry
	if (type.has("egg") && type.has("sugar") && type.has("milk") && type.has("wheat") && type.has("wildberry"))
		return "Wildberry Crepe";	
	// Egg + Butter + Salt + [Mushroom]
	if (type.has("egg") && type.has("butter") && type.has("salt") && type.has("mushroom"))
		return "Mushroom Omelet";	
	// Egg + Butter + Rice + Spice
	if (type.has("egg") && type.has("butter") && type.has("rice") && type.has("spice"))
		return "Curry Pilaf";	
	// Egg + Butter + Sugar + Wheat
	if (type.has("egg") && type.has("butter") && type.has("sugar") && type.has("wheat"))
		return "Egg Tart";
	// Egg + Butter + Salt + [Vegetable|Herb]
	if (type.has("egg") && type.has("butter") && type.has("salt") &&
		(type.has("vegetable") || type.has("herb")))
		return "Vegetable Omelet";
	// Egg + Milk + Sugar
	if (type.has("egg") && type.has("milk") && type.has("sugar"))
		return "Egg Pudding";	
	// Egg + Rice
	if (type.has("egg") && type.has("rice"))
		return "Fried Egg and Rice";	
	// Egg
	if (type.has("egg"))
		return "Omelet";
	// Rice + [Vegetable|Herb]
	if (type.has("rice") &&
		(type.has("vegetable") || type.has("herb")))
		return "Veggie Rice Balls";
	// Rice + [Meat]
	if (type.has("rice") && type.has("meat"))
		return "Meaty Rice Balls";
	// Rice + [Mushroom]
	if (type.has("rice") && type.has("mushroom"))
		return "Meaty Rice Balls";
	// Rice + spice
	if (type.has("rice") && type.has("spice"))
		return "Curry Rice";
	// Spice + [Vegetable|Herb]
	if (type.has("spice") &&
		(type.has("vegetable") || type.has("herb")))
		return "Herb Saute";
	// Spice + Herb
	if (type.has("spice") && type.has("mushroom"))
		return "Fragrant Mushroom Saute";
	// Wheat + Salt
	if (type.has("wheat") && type.has("salt"))
		return "Wheat Bread";
	// Nut + Butter + Sugar + Wheat
	if (type.has("nut") && type.has("butter") && type.has("sugar") && type.has("wheat"))
		return "Sauteed Nuts";
	// Nut
	if (type.has("nut"))
		return "Sauteed Nuts";
	// Salt + [Vegetable|Herb]
	if (type.has("salt") &&
		(type.has("vegetable") || type.has("herb")))
		return "Salt-Grilled Greens";
	// Honey + [Vegetable|Herb]
	if (type.has("honey") && (type.has("vegetable") || type.has("herb")))
		return "Glazed Veggies";
	// Honey + [Meat]
	if (type.has("honey") && type.has("meat"))
		return "Glazed Meat";
	// Honey
	if (type.has("honey"))
		return "Honey Candy";
	// Milk
	if (type.has("milk"))
		return "Warm Milk";
	return "Dubious Food";
}

/*
 * Returns the name of the dish, knowing that
 * it contains at least the 'critter' type.
 */
function critterRecipes(type) {
	// Fairy
	if (type.has("fairy"))
		return "Fairy Tonic";
	// [Critter] + [Monster] -- Only these 2 types
	if (type.has("monster"))
		return "Elixir";
	return "Dubious Food";
}

/*
 * Determines the name of a given dish
 * based on what makes it up.
 */
function getName(dish) {
	var name = "",
		type = dish.type;

	debug && console.log(dish);
	/* Monster */
	if (type.has("monster")) {
		name = monsterRecipes(type);
	}
	/* Seafood */
	else if (type.has("seafood")) {
		name = seafoodRecipes(type);
	}
	/* Fruits */
	else if (type.has("fruit")) {
		name = fruitRecipes(type);
	}
	/* Vegetable */
	else if (type.has("vegetable")) {
		name = vegetableRecipes(type);
	}
	/* Herb */
	else if (type.has("herb")) {
		name = herbRecipes(type);
	}
	/* Meat */
	else if (type.has("meat")) {
		name = meatRecipes(type);
	}
	/* Mushroom */
	else if (type.has("mushroom")) {
		name = mushroomRecipes(type);
	}
	/* Misc */
	else if (type.has("misc")) {
		name = miscRecipes(type);
	}
	/* Critter */
	else if (type.has("critter")) {
		name = critterRecipes(type);
	}
	/*
	 * No type matched: only non-edible types are left (usually cannot happen)
	 */
	else {
		return "Dubious food";
	}

	return (hasEffect(dish) ? dish.effect + " " : "") + name;
}