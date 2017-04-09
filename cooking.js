'use strict';

/*
 *	TODO
 *	- Bug: viande + effect special (duration) cree des problemes. (fonction cook)
 *	- Bug: les niveaux ne sont pas calcules correctement.
 *	- Todo: trouver les images manquantes y compris les coeurs jaunes
 */
var items = [];
var queue = [];
var effects = {
	"Mighty": "hearts.png",
	"Tough": "tough.png",
	"Enduring": "enduring.png",
	"Energizing": "energizing.png",
	"Electro": "electro.png",
	"Sneaky": "sneaky.png",
	"Hasty": "hasty.png",
	"Hearty": "hearts.png",
	"Chilly": "chilly.png",
	"Spicy": "spicy.png",
	"Fireproof": "fireproof.png"
};
var types = {
	"unknown": 	0b0000000000000000000000,
	"meat": 	0b0000000000000000000001,
	"fruit": 	0b0000000000000000000010,
	"mushroom": 0b0000000000000000000100,
	"vegetable":0b0000000000000000001000,
	"seafood": 	0b0000000000000000010000,
	"crab": 	0b0000000000000000110000, // Crab inherits from seafood
	"fish": 	0b0000000000000001010000, // Fish inherits from seafood
	"herb": 	0b0000000000000010000000,
	"insect": 	0b0000000000000100000000,
	"fairy": 	0b0000000000001000000000,
	"monster": 	0b0000000000010000000000,
	/* Misc types are actually unique */
	"nut":		0b0000000000100000000000,
	"egg": 		0b0000000001000000000000,
	"rice": 	0b0000000010000000000000,
	"salt": 	0b0000000100000000000000,
	"butter": 	0b0000001000000000000000,
	"sugar": 	0b0000010000000000000000,
	"wheat": 	0b0000100000000000000000,
	"milk": 	0b0001000000000000000000,
	"spice": 	0b0010000000000000000000,
	"honey": 	0b0100000000000000000000,
	"misc": 	0b1000000000000000000000 // Legacy code
};

var cmpFunctions = {
		"name": compareIngredientsByName,
		"type": compareIngredientsByType,
		"effect": compareIngredientsByEffect
	},
	// Global used to know how to sort items.
	cmpSelector = "name";
var debug = false;

/* Get the food.json file using the Fetch API */
if (self.fetch) {
	fetch('/food.json', {
		"method": "GET",
		"cache": "default"
	}).then(function(response) {
		return response.json();
	}).then(function(data) {
		items = data;
		UIQueue();
		UIdisplayIngredients(items, cmpFunctions[cmpSelector]);
		display(cook(queue));
	});
} else {
	console.log("Your browser is outdated and does not support the Fetch API.");
}

/* DOM Vars */
var dishImage = document.getElementById('dishImage')
	, dishTitle = document.getElementById('dishTitle')
	, dishHearts = document.getElementById('dishHearts')
	, dishEffect = document.getElementById('dishEffect')
	, dishDuration = document.getElementById('dishDuration')
	, dishLevel = document.getElementById('dishLevel')
	, ingredients = document.getElementById('ingredients').getElementsByClassName('ing')
	, ingredientList = document.getElementById('ingredientList')
	, clearBtn = document.getElementById('clearBtn')
	, sortSelect = document.getElementById('sortSelect');

/*
 * Add a separator in the ingredients list
 */
function UIaddSeparator(text) {
	ingredientList.appendChild(myCreateElement("div", {
		className: 'sqSeparator',
		innerHTML: text
	}));
}

/*
 * Setting up selection GUI
 * Displays all the ingredients after sorting them
 * 	depending on the cmpSelector variable.
 */
function UIdisplayIngredients(items) {
	var cmpf = cmpFunctions[cmpSelector];

	while (ingredientList.firstChild) {
		ingredientList.removeChild(ingredientList.firstChild);
	}
	if (items == null) {
		ingredientList.appendChild(myCreateElement("div", {
			innerHTML: 'An error occurred while retrieving items. Please come back later.'
		}));
		return ;
	}
	items.sort(cmpf);
	for (var i = 0; i < items.length; i++) {
		var d = myCreateElement('div', {
			className: 'sq ing',
			innerHTML: htmlIngredient(items[i])
		});

		(function() {
			var ci = i;
			d.onclick = function() {
				addToQueue(items[ci]);
			};
		})();
		// If we meet a new type/name/effect, add a separator
		// For names, only sort by first letter, otherwise it's a mess.
		if (i == 0) {
			if (cmpSelector == "name")
				UIaddSeparator(items[i].name[0]);
			else
				UIaddSeparator(items[i][cmpSelector]);
		} else if (cmpf(items[i - 1], items[i]) != 0) {
			if (cmpSelector == "name") {
				if (items[i - 1].name[0] != items[i].name[0]) {
					UIaddSeparator(items[i].name[0]);
				}
			} else {
				UIaddSeparator(items[i][cmpSelector]);
			}
		}
		ingredientList.appendChild(d);
	}
}

/*
 * Setting up queue GUI
 */
function UIQueue() {
	for (var i = 0; i < ingredients.length; i++) {
		(function() {
			var ci = i;
			ingredients[ci].onclick = function() {
				removeFromQueue(ci);
			};
		})();
	}
}

/*
 * Event listeners
 */
clearBtn.onclick = function() {
	queue = [];
	refreshQueue();
}
sortSelect.onchange = function() {
	cmpSelector = sortSelect.value;
	UIdisplayIngredients(items);
}

/*********************/
/* Cooking functions */
/*********************/

/*
 * Combine an array of ingredients (NOT pseudo-ingredients).
 * Allows to handle effect conflicts more efficiently and levels.
 */
function cook(ing) {
	var dish = {};

	if (ing.length == 0)
		return null;
	dish.type = types["unknown"];
	dish.hearts = 0;
	dish.effect = "none";
	dish.duration = 0;
	dish.level = 0;
	// create an intermediate array containing pseudo-ingredients (ex: carp lv.2 + 3*apple)
	var ping = [];

	ing.forEach(function(e) {
		if (nbTimesInArray(e, ping) == 0) {
			ping.push(repeatIngredient(e, nbTimesInArray(e, ing)));
		}
	});
	ping.forEach(function(e) {
		dish.type |= types[e.type];
		// Hearty ingredients give full hearts.
		if (e.hearts == -1)
			dish.hearts = -1;
		else if (dish.hearts != -1)
			dish.hearts += e.hearts;
		// Effect conflicts
		if (dish.effect == "none") // No effect applied for now
			dish.effect = e.effect;
		else if (e.effect != "none" && e.effect != dish.effect) // Trying to apply a new effect to existing one: conflict detected.
			dish.effect = "cancelled";
		// Avoid mixing effect duration and hearty hearts.
		if (dish.effect != "Hearty" && e.effect != "Hearty")
			dish.duration += e.duration;
		else if (dish.effect == "Hearty" && e.effect == "Hearty")
			dish.duration += e.duration;
		dish.level = Math.max(dish.level, e.level);
	});
	dish.name = getName(dish);
	dish.image = getImage(dish);
	return dish;
}

/*
 * Create a pseudo-ingredient from n ingredients of the same type.
 * We MUST use this function to be able to manipulate an ingredient
 *  later on when mixing them (because it has a fixed heart/dur/level).
 */
function repeatIngredient(ing, n) {
	var ning = {};

	if (ing === null || n === undefined || n <= 0 || n > 5)
		return null;
	debug && console.log('Repeating ' + ing.name + ' ' + n + ' times');
	ning.name = ing.name;
	ning.type = ing.type;
	ning.hearts = ing.hearts[n - 1];
	ning.effect = ing.effect;
	ning.duration = ing.duration[n - 1];
	ning.level = ing.level[n - 1];
	ning.image = ing.image;
	return ning;
}

/*
 * Returns the number of times an ingredient appears
 * in the queue
 */
function nbTimesInArray(ing, arr) {
	var n = 0;
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].name == ing.name) {
			n++;
		}
	}
	return n;
}

/*
 * Display the dish
 */
function display(dish) {
	if (dish != null) {
		dishImage.innerHTML = dish.image;
		dishTitle.innerHTML = dish.name || "none";
		dishHearts.innerHTML = htmlHearts(dish.hearts);
		dishEffect.innerHTML = 'Effect: ' + htmlEffect(dish.effect) + dish.effect || "none";
		if (dish.effect == "Enduring") {
			dishDuration.innerHTML = 'Refill: ' + dish.duration + ' bars';
		} else if (dish.effect == "Energizing") {
			dishDuration.innerHTML = 'Bonus: ' + dish.duration + '%';
		} else if (dish.effect == "Hearty") {
			dishDuration.innerHTML = 'Extra Hearts ' + htmlHearts(dish.duration, true);
		} else if (dish.effect != "cancelled") {
			dishDuration.innerHTML = 'Duration: ' +
				Math.floor(dish.duration / 60) + ' minutes ' + 
				(dish.duration % 60) + ' seconds.';
		} else {
			dishDuration.innerHTML = '';
		}
		dishLevel.innerHTML = dish.level && 'Level ' + dish.level || '';
	} else {
		dishImage.innerHTML = "";
		dishTitle.innerHTML = "";
		dishHearts.innerHTML = "";
		dishEffect.innerHTML = "";
		dishDuration.innerHTML = "";
		dishLevel.innerHTML = "";
	}
}

/*
 * Returns a name for a given type of dish
 */
function getName(dish) {
	var name = "",
		type = dish.type;

	// Prepend by effect
	if (dish.effect != "none" && dish.effect != "cancelled")
		name += dish.effect + ' ';
	// Actual name
	//- Check for recipes first
	//-- MEAT
	//--- General
	if (type & types["meat"] && type & types["milk"] && type & types["salt"] &&
				(type & types["herb"] || type & types["vegetable"])) {
		name += "Creamy Meat Soup";
	} else if (type & types["meat"] && type & types["wheat"] &&
				type & types["butter"] && type & types["milk"]) {
		name += "Meat Stew";
	} else if (type & types["meat"] && type & types["wheat"] &&
				type & types["butter"] && type & types["salt"]) {
		name += "Meat Pie";
	} else if (type & types["meat"] && type & types["rice"] &&
				type & types["spice"]) {
		name += "Meat Curry";
	} else if (type & types["meat"] && type & types["rice"] &&
				type & types["salt"]) {
		name += "Meat and Rice Bowl";
	} else if (type & types["meat"] && type & types["seafood"]) {
		name += "Meat and seafood fry";
	} else if (type & types["meat"] && type & types["salt"]) {
		name += "Salt-Grilled meat";
	} else if (type & types["meat"] && type & types["honey"]) {
		name += "Glazed Meat";
	} else if (type & types["meat"] && type & types["mushroom"]) {
		name += "Meat and mushroom skewer";
	} else if (type & types["meat"] && type & types["herb"]) {
		name += "Steamed Meat";
	} else if (type & types["meat"] && type & types["spice"]) {
		name += "Spiced Meat Skewer";
	} else if (type == types["meat"]) {
		name += "Meat Skewer";
	//-- SEAFOOD
	//--- Fish
	} else if (type & types["fish"] && type & types["salt"]) {
		name += "Salt-Grilled Fish";
	} else if (type & types["fish"] && type & types["mushroom"]) {
		name += "Fish and mushroom skewer";
	} else if (type == types["fish"]) {
		name += "Fish skewer";
	//--- Crab
	} else if (type & types["crab"] && type & types["rice"] &&
				type & types["butter"] && type & types["salt"]) {
		name += "Crab Risotto";
	} else if (type & types["crab"] && type & types["rice"] &&
				type & types["egg"] && type & types["salt"]) {
		name += "Crab Omelet with Rice";
	} else if (type & types["crab"] && type & types["salt"]) {
		name += "Salt-Grilled Crab";
	} else if (type & types["crab"] && type & types["spice"]) {
		name += "Crab Stir-Fry";
	//--- General
	} else if (type & types["seafood"] && type & types["milk"] && type & types["salt"] &&
				(type & types["herb"] || type & types["vegetable"])) {
		name += "Creamy Seafood Soup";
	} else if (type & types["seafood"] && type & types["wheat"] &&
				type & types["butter"] && type & types["salt"]) {
		name += "Fish Pie";
	} else if (type & types["seafood"] && type & types["herb"]) {
		name += "Steamed Fish";
	} else if (type & types["seafood"] && type & types["rice"]) {
		name += "Seafood Rice Balls";
	} else if (type & types["seafood"] && type & types["honey"]) {
		name += "Glazed Seafood";
	} else if (type == types["seafood"]) {
		name += "Seafood Skewer";
	//-- FRUIT
	} else if (type & types["fruit"] && type & types["wheat"] &&
				type & types["sugar"] && type & types["butter"]) {
		name += "Fruit Pie";
	} else if (type & types["fruit"] && type & types["mushroom"]) {
		name += "Fruit and Mushroom mix";
	} else if (type & types["fruit"] && type & types["honey"]) {
		name += "Honeyed Fruits";
	} else if (type & types["fruit"] &&
				(type & types["herb"] || type & types["vegetable"])) {
		name += "Steamed Fruit";
	} else if (type == types["fruit"]) {
		name += "Simmered fruit";
	//-- MUSHROOM
	} else if (type & types["mushroom"] && type & types["milk"] && type & types["salt"] &&
				(type & types["herb"] || type & types["vegetable"])) {
		name += "Cream of Mushroom Soup";
	} else if (type & types["mushroom"] && type & types["egg"] &&
				type & types["butter"] && type & types["salt"]) {
		name += "Mushroom Omelet";
	} else if (type & types["mushroom"] && type & types["rice"] &&
				type & types["butter"] && type & types["salt"]) {
		name += "Mushroom Risotto";
	} else if (type & types["mushroom"] &&
				(type & types["vegetable"] || type & types["herb"])) {
		name += "Steamed Mushrooms";
	} else if (type & types["mushroom"] && type & types["rice"]) {
		name += "Mushroom Rice Balls";
	} else if (type & types["mushroom"] && type & types["salt"]) {
		name += "Salt-Grilled Mushrooms";
	} else if (type & types["mushroom"] && type & types["honey"]) {
		name += "Glazed Mushrooms";
	} else if (type & types["mushroom"] && type & types["spice"]) {
		name += "Fragrant Mushroom Saute";
	} else if (type == types["mushroom"]) {
		name += "Mushroom skewer";
	//-- INSECT (elixir)
	} else if (type & types["insect"] && type & types["monster"]) {
		name += "Elixir";
	//-- MISCELLANEOUS
	} else if (type & types["milk"] && type & types["sugar"] &&
				type & types["wheat"] && type & types["egg"] &&
				type & types["honey"]) {
		name += "Honey Crepe";
	} else if (type & types["milk"] && type & types["sugar"] &&
				type & types["wheat"] && type & types["egg"] &&
				type & types["butter"]) {
		name += "Plain Crepe";
	} else if (type & types["rice"] && type & types["egg"] &&
				type & types["butter"] && type & types["spice"]) {
		name += "Curry Pilaf";
	} else if (type & types["spice"] &&
				(type & types["vegetable"] || type & types["herb"])) {
		name += "Herb Saute";
	} else if (type & types["honey"] &&
				(type & types["vegetable"] || type & types["herb"])) {
		name += "Glazed Veggies";
	} else if (type & types["nut"] && type & types["sugar"] &&
				type & types["wheat"] && type & types["butter"]) {
		name += "Nutcake";
	} else if (type & types["wheat"] && type & types["egg"] &&
				type & types["sugar"] && type & types["butter"]) {
		name += "Egg Tart";
	} else if (type & types["milk"] && type & types["egg"] &&
				type & types["sugar"]) {
		name += "Egg Pudding";
	} else if (type & types["rice"] &&
				(type & types["vegetable"] || type & types["herb"])) {
		name += "Veggie Rice Balls";
	} else if (type & types["egg"] && type & types["butter"] && type & types["salt"] &&
				(type & types["vegetable"] || type & types["herb"])) {
		name += "Vegetable Omelet";
	} else if (type & types["salt"] &&
				(type & types["vegetable"] || type & types["herb"])) {
		name += "Salt-Grilled Greens";
	} else if (type & types["spice"] && type & types["rice"]) {
		name += "Curry Rice";
	} else if (type & types["egg"] && type & types["rice"]) {
		name += "Fried Egg and Rice";
	} else if (type & types["wheat"] && type & types["salt"]) {
		name += "Wheat Bread";
	} else if (type == types["egg"]) {
		name += "Omelet";
	} else if (type == types["milk"]) {
		name += "Warm Milk";
	} else if (type == types["nut"]) {
		name += "Sauteed Nuts";
	} else if (type == types["honey"]) {
		name += "Honey Candy";
	//- And then lone types
	} else if (type == types["fairy"]) {
		name += "Fairy Tonic";
	} else if (type & types["herb"] || type & types["vegetable"]) {
		name += "Fried Wild Greens";
	} else {
		name = "Dubious food";
	}
	return name;
}

/*
 * Returns an image for a given type of dish
 */
function getImage(dish) {
	var name = '<img src="/img/food/',
		dname = dish.name, ename;

	// Unless it is an elixir, ignore the effect to get a generic image
	if (dname.indexOf("Elixir") == -1) {
		ename = dname.substring(0, dname.indexOf(' '));
		if (effects[ename])
			dname = dname.slice(ename.length);
	}
	name += dname.replace(/\s/g, '').toLowerCase(); // Remove whitespaces
	return name + '.png"/>';
}

/********************/
/* Helper functions */
/********************/

/*
 * Display a list of ingredients
 */
function printIngredients(ing) {
	for (var i = 0; i < ing.length; i++) {
		console.log(ing[i]);
	}
}

/*
 * Transforms an ingredient into an html string to display its image & description
 */
function htmlIngredient(ing) {
	return '<img src="/img/food/' + ing.image + '"/>' +
			'<div class="sqTooltip">' + 
				'<div class="sqTooltipHeader">' + 
					ing.name + 
				'</div>' +
				'<div class="sqTooltipContent">' + 
					'Type: ' + ing.type + '<br>' +
					'Effect: ' + ing.effect + '<br>' +
					'Level curve: ' + ing.level +
				'</div>' +
			'</div>';
}

/*
 * Transforms an amount of hearts into an html string to display them
 * arg extra - true if the hearts are extra (yellow)
 */
function htmlHearts(n, extra) {
	var s = "";

	if (n == -1) // Special case: -1 means full recovery
		return '<img src="/img/heart100.png"/>' + ' Full Recovery';
	while (n >= 1) {
		if (n > 10) {
			s += '<img src="/img/' + (extra ? 'y' : '') + 'heart1000.png"/>';
			n -= 10;
		} else if (n > 5) {
			s += '<img src="/img/' + (extra ? 'y' : '') + 'heart500.png"/>';
			n -= 5;
		} else {
			s += '<img src="/img/' + (extra ? 'y' : '') + 'heart100.png"/>';
			n--;
		}
	}
	if (n > 0) // 0 < n < 1
		s += '<img src="/img/' + (extra ? 'y' : '') + 'heart' + (n * 100) + '.png"/>';
	return s;
}

/*
 * Transforms an effect into an html string to display it
 */
function htmlEffect(effect) {
	if (effect != undefined && effects[effect] != undefined)
		return '<img src="/img/fx/' + effects[effect] + '"/>'
	return '';
}

/*
 * Search an ingredient by its name
 */
function getIngredient(name) {
	for (var i = 0; i < items.length; i++) {
		if (name == items[i].name)
			return items[i];
	}
	return null;
}

function addToQueue(ing) {
	if (queue.length == 5) {
		debug && console.log('Queue is already full!');
	} else {
		queue.push(ing);
		refreshQueue();
	}
}
function removeFromQueue(i) {
	if (i < 0 || i >= queue.length)
		return ;
	queue.splice(i, 1);
	refreshQueue();
}

/*
 * Refresh the images in the queue
 */
function refreshQueue() {
	for (var i = 0; i < 5; i++) {
		if (i < queue.length)
			ingredients[i].innerHTML = htmlIngredient(queue[i]);
		else
			ingredients[i].innerHTML = '';
	}
	display(cook(queue));
}
