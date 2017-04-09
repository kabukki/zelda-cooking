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
	"unknown": 	0b000000000000,
	"meat": 	0b000000000001,
	"fruit": 	0b000000000010,
	"mushroom": 0b000000000100,
	"vegetable":0b000000001000,
	"seafood": 	0b000000010000,
	"misc": 	0b000000100000,
	"herb": 	0b000001000000,
	"salt": 	0b000010000000,
	"nut": 		0b000100000000,
	"insect": 	0b001000000000,
	"fairy": 	0b010000000000,
	"monster": 	0b100000000000
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
		UIIngredients(items, cmpFunctions[cmpSelector]);
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
	var s = document.createElement("div");
	s.className = 'sqSeparator';
	s.innerHTML = text;
	ingredientList.appendChild(s);
}

/*
 * Setting up selection GUI
 * Displays all the ingredients after sorting them
 * 	depending on the cmpSelector variable.
 */
function UIIngredients(items) {
	var cmpf = cmpFunctions[cmpSelector];

	while (ingredientList.firstChild) {
		ingredientList.removeChild(ingredientList.firstChild);
	}
	if (items == null) {
		var d = document.createElement("div")
		d.innerHTML = 'An error occurred while retrieving items. Please come back later.';
		ingredientList.appendChild(d);
		return ;
	}
	items.sort(cmpf);
	for (var i = 0; i < items.length; i++) {
		var d = document.createElement("div");

		d.className = 'sq ing';
		d.innerHTML = htmlIngredient(items[i]);
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
	UIIngredients(items);
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
	/// Check for combos first
	//// Meat
	if (type & types["meat"] && type & types["seafood"]) {
		name += "Meat and seafood fry";
	} else if (type & types["meat"] && type & types["salt"]) {
		name += "Salt-Grilled meat";
	} else if (type & types["meat"] && type & types["mushroom"]) {
		name += "Meat and mushroom skewer";
	} else if (type & types["meat"] && type & types["herb"]) {
		name += "Steamed Meat";
	//// Seafood
	} else if (type & types["seafood"] && type & types["salt"]) {
		name += "Salt-Grilled Fish";
	} else if (type & types["seafood"] && type & types["herb"]) {
		name += "Steamed Fish";
	} else if (type & types["seafood"] && type & types["mushroom"]) {
		name += "Fish and mushroom skewer";
	//// Fruit
	} else if (type & types["fruit"] && type & types["mushroom"]) {
		name += "Fruit and Mushroom mix";
	} else if (type & types["fruit"] && (type & types["herb"] ||
										 type & types["vegetable"])) {
		name += "Steamed Fruit";
	//// Herb
	} else if (type & types["herb"] && type & types["mushroom"]) {
		name += "Steamed Mushrooms";
	//// Insect (elixir)
	} else if (type & types["insect"] && type & types["monster"]) {
		name += "Elixir";
	/// And then lone types
	} else if (type & types["fairy"]) {
		name += "Fairy Tonic";
	} else if (type & types["meat"]) {
		name += "Meat Skewer";
	} else if (type & types["fruit"]) {
		name += "Simmered fruit";
	} else if (type & types["seafood"]) {
		name += "Fish skewer";
	} else if (type & types["mushroom"]) {
		name += "Mushroom skewer";
	} else if (type & types["herb"]) {
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
