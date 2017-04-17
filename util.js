'use strict';

var debug = true;

/*
 * Compare ingredients by name
 */
function compareByName(a, b) {
	return strcmp(a.name, b.name);
}

/*
 * Compare ingredients by effect
 */
function compareByEffect(a, b) {
	return strcmp(a.effect, b.effect);
}

/*
 * Compare ingredients by type (primitive type)
 */
function compareByType(a, b) {
	return strcmp(a.type[0], b.type[0]);
}

/*
 * strcmp
 */
function strcmp(a, b) {
	return (a > b ? 1 : 
			a < b ? -1 : 0);
}

/*
 * Returns true if the dish has an active effect
 */
function hasEffect(dish) {
	return (dish.effect != "none" && dish.effect != "cancelled");
}

/*
 * Returns true if the dish has a regular active effect (timed)
 */
function hasRegularEffect(dish) {
	return (hasEffect(dish) &&
			dish.effect != "hearty" && dish.effect != "energizing" && dish.effect != "enduring");
}

/*
 * Returns true if any element of source appears in target
 */
function appearsIn(target, source) {
	if (!target || !source) return false;
	for (var i = 0; i < source.length; i++) {
		if (target.indexOf(source[i]) != -1)
			return true;
	}
	return false;
}

/*********************************/
/* Ingredient properties to HTML */
/*********************************/

/*
 * Transforms an ingredient into an html string to display its image & description
 */
function htmlIngredient(ing) {
	return '<img src="img/food/' + ing.image + '"/>' +
			'<div class="sqTooltip">' + 
				'<div class="sqTooltipHeader">' + 
					ing.name + 
				'</div>' +
				'<div class="sqTooltipContent">' + 
					'Type: ' + ing.type.join(' > ') + '<br>' +
					'Effect: ' + ing.effect + '<br>' +
					'<a href="info.html?id=' + ing.id + '">more info</a>' +
				'</div>' +
			'</div>';
}

/*
 * Transforms an amount of hearts into an html string to display them
 */
function htmlHearts(n) {
	var s = "";

	if (n == 0)
		return '<img src="img/heart0.png"/>';
	if (n >= 30)
		return '<img src="img/heart100.png"/>' + ' Full Recovery';
	while (n >= 1) {
		if (n > 10) {
			s += '<img src="img/heart1000.png"/>';
			n -= 10;
		} else if (n > 5) {
			s += '<img src="img/heart500.png"/>';
			n -= 5;
		} else {
			s += '<img src="img/heart100.png"/>';
			n--;
		}
	}
	if (n > 0) // 0 < n < 1
		s += '<img src="img/heart' + (n * 100) + '.png"/>';
	return s;
}

/*
 * Transforms an amount of extra hearts into an html string to display them
 */
function htmlExtraHearts(n) {
	if (n == 0)
		return '0';
	return '<img src="img/yheart100.png"/>' + ' + ' + n;
}

/*
 * Transforms an amount of stamina into an html string to display it
 */
function htmlStamina(n) {
	return '<img src="img/fx/energizing.png"/>' + ' ' + n + ' %';
}

/*
 * Transforms an amount of extra stamina into an html string to display it
 */
function htmlExtraStamina(n) {
	return '<img src="img/fx/enduring.png"/>' + ' ' + n + ' %';
}

/*
 * Returns the html image for a given food
 */
function htmlEffect(food) {
	return (hasEffect(food) ? '<img src="img/fx/' + food.effect + '.png"/>' : '');
}

/*
 * Returns the html image for a given food
 */
function htmlType(type) {
	return '<a href="index.html?type=' + type + '"/>' + type + '</a>';
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

/* 
 * Returns the description for a given effect
 */
function getEffectDescription(effect) {
	switch (effect) {
		case "energizing": 	return "Refill (%)";
		case "enduring": 	return "Bonus (wheel)";
		case "hearty": 		return "Extra hearts";
		default: 			return "Duration"
	}
}

/* 
 * Returns the html transform function to display a given effect
 */
function getEffectTransform(effect) {
	switch (effect) {
		case "energizing": 	return htmlStamina;
		case "enduring": 	return htmlExtraStamina;
		case "hearty": 		return htmlExtraHearts;
		default: 			return legibleTime;
	}
}

/**********************************/
/* Food combining logic & recipes */
/**********************************/

/*
 * Combine a list of ingredients into pseudo-ingredients
 */
function reduceIngredients(ing) {
	var ping = [];

	ing.forEach(function(e) {
		if (nbTimesInArray(e, ping) == 0) {
			ping.push(repeatIngredient(e, nbTimesInArray(e, ing)));
		}
	});
	return ping;
}

/*
 * Combine a list of ingredients
 */
function combine(ing) {
	var ping = reduceIngredients(ing);
	var food = {};

	/* Affecting hearts to dish */
	food.hearts = ping.reduce(function(a, b) {
		return a + b.hearts;
	}, 0);
	/* Affecting effect to dish */
	// TODO: replace "none"/"cancelled" by NULL values ?
	food.effect = [...new Set(ping
							.filter(function(x) { return x.effect != "none"; })
							.map(function(x) { return x.effect; })
				)];
	if (food.effect.length > 1)
		food.effect = "cancelled";
	else if (food.effect.length == 0)
		food.effect = "none";
	else
		food.effect = food.effect[0];
	/* Affecting type to dish */
	food.type = [...new Set(ping
							.map(function(x) { return x.type; })
							.reduce(function(a, b) { return a.concat(b); })
				)];
	/* Affecting duration to dish */
	// TODO: Check if duration boost to special effects is used or not
	food.duration = hasEffect(food) ? ping.reduce(function(a, b) {
		return (b.effect == food.effect ||
				(hasRegularEffect(food) && b.effect == "none") ? a + b.duration : a);
	}, 0) : 0;
	/* Affecting level to dish */
	// TODO: find real logic behind dish levels
	food.level = ping.reduce(function(a, b) {
		return Math.max(a, b.level);
	}, 0);
	return food;
}

/*
 * Returns the best recipe among 'recipes' according to ...
 * - number of required ingredients
 * ? other criteria to be found in game.
 * ? type prioritaire, misc > vegetable par exemple ?
 */
function getBestMatch(recipes) {
 	var best = 0;

 	for (var i = 0; i < recipes.length; i++) {
 		if (recipes[best].required.length < recipes[i].required.length)
 			best = i;
	}
 	return recipes[best];
}

/*
 * Returns every recipe you can make with the given ingredients
 */
function getAvailableRecipes(list, ing) {
	var available = [], recipes, ci;

	ci = combine(ing);
	// Get every recipe that use our ingredients
	recipes = getRelatedRecipes(list, ci);
	recipes.forEach(function(recipe) {
		// If the ingredients fulfill the requirements of recipe, save it
		if (recipe.required.filter(function(req) {
			return (ci.type.indexOf(req) != -1);
		}).length == recipe.required.length)
			available.push(recipe);
	});
	return available;
}

/*
 * Get all dishes that have 'ing.type' in their 'required' field but not in their 'excluded' field,
 * from the 'list' ingredient list.
 */
function getRelatedRecipes(list, ing) {
	var recipes = [];

	for (var type in list) { // Loop every type => any, apple, ...
		// If this subtype is a terminal subtype
		if (list[type] instanceof Array) {
			// Add every single recipe in this subtype to our list
			for (var i = 0; i < list[type].length; i++) {
				if (!appearsIn(list[type][i].required, ing.type) || appearsIn(list[type][i].excluded, ing.type))
					continue ;
				recipes.push(list[type][i]);
			}
		}
		// Else this is another parent class (Object)
		else {
			var subrecipes = getRelatedRecipes(list[type], ing);

			for (var j = 0; j < subrecipes.length; j++)
				recipes.push(subrecipes[j]);
		}
	}
	return recipes;
}

/*
 * Returns the recipe object whose name matches the one given in parameter
 */
function getRecipe(list, name) {
	for (var type in list) { // Loop every type => any, apple, ...
		// If this subtype is a terminal subtype
		if (list[type] instanceof Array) {
			for (var i = 0; i < list[type].length; i++) {
				if (list[type][i].name == name)
					return list[type][i];
			}
		}
		// Else this is another parent class (Object)
		else {
			var found = getRecipe(list[type], name);

			if (found)
				return found;
		}
	}
	return null;	
}

/*
 * Returns the ingredient object whose name matches the one given in parameter
 */
function getIngredient(list, name) {
	for (var i = 0; i < list.length; i++) {
		if (list[i].name == name)
			return list[i];
	}
	return null;	
}

/***********/
/* Helpers */
/***********/

/*
 * Fetch a file, then execute a callback with JSON data
 */
function fetchThen(file, callback) {
	fetch(file, {
		"method": "GET",
		"cache": "default"
	})
	.then(function(response) { return response.json();})
	.then(callback);	
}

/*
 * Creates a DOM element with the given attributes
 */
function myCreateElement(tag, attr) {
	var e = document.createElement(tag);

	for (var key in attr) {
		if (!attr.hasOwnProperty(key)) continue;
		e[key] = attr[key];
	}
	return e;
}

/* GET parameters */
function getParam(key) {
    var result = null,
        tmp = [];
    window.location.search
      .substr(1) // remove '?'
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === key)
            result = decodeURIComponent(tmp[1]);
      });
    return result;
}

function legibleTime(seconds) {
	var m = Math.floor(seconds / 60),
		s = seconds % 60;

	return (padLeft(m, 2) + ':' + padLeft(s, 2));
}

function padLeft(number, n, sep) {
	return Array(n - String(number).length + 1).join(sep || '0') + number;
}
