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
function compareIngredientsByName(a, b) {
	return strcmp(a.name, b.name);
}

/*
 * Compare ingredients by effect
 */
function compareIngredientsByEffect(a, b) {
	return strcmp(a.effect, b.effect);
}

/*
 * Compare ingredients by type
 */
function compareIngredientsByType(a, b) {
	return strcmp(a.type, b.type);
}

/*
 * Compare ingredients by type (primitive type)
 */
function compareIngredientsBytYpe(a, b) {
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
 * arg extra - true if the hearts are extra (yellow)
 */
function htmlHearts(n, extra) {
	var s = "";

	if (n == -1) // Special case: -1 means full recovery
		return '<img src="img/heart100.png"/>' + ' Full Recovery';
	while (n >= 1) {
		if (n > 10) {
			s += '<img src="img/' + (extra ? 'y' : '') + 'heart1000.png"/>';
			n -= 10;
		} else if (n > 5) {
			s += '<img src="img/' + (extra ? 'y' : '') + 'heart500.png"/>';
			n -= 5;
		} else {
			s += '<img src="img/' + (extra ? 'y' : '') + 'heart100.png"/>';
			n--;
		}
	}
	if (n > 0) // 0 < n < 1
		s += '<img src="img/' + (extra ? 'y' : '') + 'heart' + (n * 100) + '.png"/>';
	return s;
}
