// Generate unique id with a given length.

var pool = [];

module.exports = function generate (length) {
	var id = "";
	length = length || 10;

	while (id.length < length) {
		id += Math.random().toString(16).slice(2);
	}

	id = id.slice(-length);

	id = pool.indexOf(id) > -1 ? generate(length) : id;

	pool.push(id);

	return id;
};