'use strict';

/*
 * Order ingredients by name
 */
function compareIngredientsByName(a, b) {
	if (a.name > b.name) return 1;
	if (a.name < b.name) return -1;
	return 0;
}

/*
 * Order ingredients by effect
 */
function compareIngredientsByEffect(a, b) {
	if (a.effect > b.effect) return 1;
	if (a.effect < b.effect) return -1;
	return 0;
}

/*
 * Order ingredients by type
 */
function compareIngredientsByType(a, b) {
	if (a.type > b.type) return 1;
	if (a.type < b.type) return -1;
	return 0;
}
