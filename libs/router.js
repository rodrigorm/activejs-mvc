var Router = {};

if(typeof exports != "undefined"){
    exports.Router = Router;
}

(function(){

Router.routes = new ActiveRoutes([]);

Router.active_routes_defaults = {
	object: 'Router', 
	method: 'active_routes_dispatch'
};

Router.connect = function connect(path, defaultParams) {
	var defaults = ActiveSupport.extend({}, Router.active_routes_defaults);
	var params = ActiveSupport.extend(defaults, defaultParams || {});
	Router.routes.addRoute(path, params);
};

Router.parse = function parse(url) {
	Router.__connectDefaultRoutes();

	var active_route = Router.routes.match(url);
	var route = {
		controller: '', 
		action: '', 
		pass: []
	};

	if (!active_route) {
		return false;
	}

	route.controller = active_route.params.controller;
	route.action = active_route.params.action;

	if (route.path) {
		route.pass = route.path;
	}

	return route;
};

Router.url = function url(url) {
	Router.__connectDefaultRoutes();

	if (typeof(url) == 'object') {
		var defaults = ActiveSupport.extend({}, Router.active_routes_defaults);
		url = ActiveSupport.extend(defaults, url);
	}

	return Router.routes.urlFor(url);
};


Router.__defaultsMapped = false;
Router.__connectDefaultRoutes = function __connectDefaultRoutes() {
	if (Router.__defaultsMapped) {
		return;
	}
	
	Router.connect('/:controller', {action: 'index'});
	Router.connect('/:controller/:action/*');

	Router.__defaultsMapped = true;
};

Router.active_routes_dispatch = function() {};

})();