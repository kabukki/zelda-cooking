'use strict';

/*
 *	TODO
 *	- Bug: viande + effect special (duration) cree des problemes. (fonction cook)
 *	- Bug: les niveaux ne sont pas calcules correctement.
 *  - Bug: Clicking on 'more info' on an ingredient in the queue pops it before redirecting
 *	- Todo: trouver les images manquantes y compris les coeurs jaunes
 *	- Todo: trouver les proprietes de nouveaux ingredients.
 *	- Todo: mettre au propre UIdisplayIngredients.
 *	- Todo: Finir de remplir les recettes misc pour que la fonction puisse evaluer en stand-alone un repas.
 *  - Todo: page referencant tous les ingredients d'un type donne (encyclopedia.html?type=fruit)
 */

var debug = true;

var items = [], dishes = [];
var queue = [];

var cmpFunctions = {
		"name": compareByName,
		"type": compareByType,
		"effect": compareByEffect
	},
	cmpSelector = "name"; // Global used to know how to sort items.

/* DOM Vars */
var dishImage = document.getElementsByClassName('dishImage')[0]
	, dishTitle = document.getElementsByClassName('dishTitle')[0]
	, dishHearts = document.getElementById('dishHearts')
	, dishEffect = document.getElementById('dishEffect')
	, dishDuration = document.getElementById('dishDuration')
	, dishLevel = document.getElementById('dishLevel')
	, ingredients = document.getElementById('ingredients').getElementsByClassName('ing')
	, ingredientList = document.getElementById('ingredientList')
	, clearBtn = document.getElementById('clearBtn')
	, sortSelect = document.getElementById('sortSelect');

/* Get the food.json file using the Fetch API */
if (self.fetch) {
	fetchThen('food.json', function(data) {
		items = data;
		debug && console.log("Items loaded");
		fetchThen('recipes.json', function(data) {
			dishes = data;
			debug && console.log("Dishes loaded");
			for (var i = 0; i < items.length; i++) {
				items[i].id = i;
			}
			UIQueue();
			UIdisplayIngredients(items, cmpFunctions[cmpSelector]);
			display(cook(queue));
		});
	});
} else {
	console.log("Your browser is outdated and does not support the Fetch API.");
}

/******************/
/* User Interface */
/******************/

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
 * 	 depending on the cmpSelector variable.
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
			d.getElementsByTagName("img")[0].onclick = function() {
				addToQueue(items[ci]);
			};
		})();
		// If we meet a new type/name/effect, add a separator
		// For names, only sort by first letter.
		if (i == 0) {
			if (cmpSelector == "name")
				UIaddSeparator(items[i].name[0]);
			else if (cmpSelector == "type")
				UIaddSeparator(items[i].type[0]);
			else
				UIaddSeparator(items[i][cmpSelector]);
		} else if (cmpf(items[i - 1], items[i]) != 0) {
			if (cmpSelector == "name") {
				if (items[i - 1].name[0] != items[i].name[0]) {
					UIaddSeparator(items[i].name[0]);
				}
			} else if (cmpSelector == "type") {
				UIaddSeparator(items[i].type[0]);
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
	dish.type = new Set();
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
		e.type.forEach(function(type) {
			dish.type.add(type);
		});
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
	dish.name = getBestMatch(getAvailableRecipes(ing)).name;
	if (hasEffect(dish))
		dish.name = dish.effect + ' ' + dish.name;
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
		dishTitle.innerHTML = dish.name;
		dishHearts.innerHTML = htmlHearts(dish.hearts);
		dishEffect.innerHTML = 'Effect: ' + htmlEffect(dish) + dish.effect;
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
 * Returns an image for a given type of dish
 */
function getImage(dish) {
	var name = '<img src="img/food/',
		dname = dish.name.toLowerCase(), ename;

	// Unless it is an elixir, ignore the effect to get a generic image
	if (dname.indexOf("elixir") == -1) {
		ename = dname.substring(0, dname.indexOf(' '));
		if (ename == dish.effect)
			dname = dname.slice(ename.length);
	}
	name += dname.replace(/\s/g, ''); // Remove whitespaces
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
 * Transforms an effect into an html string to display it
 */
function htmlEffect(dish) {
	if (dish !== undefined && hasEffect(dish))
		return '<img src="img/fx/' + dish.effect + '.png"/>'
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
