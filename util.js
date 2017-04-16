'use strict';

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
 * Uniq an array of objects depending on prop property
 */
function uniqProp(arr, prop) {
	var seen = {};

	return arr.filter(function(item) {
		return seen[item[prop]] ? false : (seen[item[prop]] = true);
	});
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

/*
 * Returns true if the dish has an active effect
 */
function hasEffect(dish) {
	return (dish.effect != "none" && dish.effect != "cancelled");
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
		return '0';
	if (n == -1) // Special case: -1 means full recovery
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
 * Combine a list of ingredients
 */
function combine(ing) {
	var food = {
		name: "",
		effect: null,
		type: []
	};

	ing.forEach(function(x) {
		x.type.forEach(function(type) {
			if (food.type.indexOf(type) == -1)
				food.type.push(type);
		})
	});
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
function getAvailableRecipes(ing) {
	var available = [], recipes, ci;

	ci = combine(ing);
	// Get every recipe that use our ingredients
	recipes = getRelatedRecipes(dishes, ci);
	recipes.forEach(function(recipe) {
		// If the ingredients fulfill the requirements of recipe, save it
		if (recipe.required.filter(function(req) {
			return (ci.type.indexOf(req) != -1);
		}).length == recipe.required.length)
			available.push(recipe);
	});
	return uniqProp(available, "name");
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
				// If this recipe excludes our ingredient, ignore it (ex. recipes without pumpkin)
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
