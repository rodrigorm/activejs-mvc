var Dispatcher = null;

if(typeof exports != "undefined"){
    exports.Dispatcher = Dispatcher;
}

(function(){

Dispatcher = function Dispatcher() {
	this.initialize();
}


Dispatcher.prototype = {
	initialize: function initialize () {
		this.params = {};
		this.here = '';
	}, 

	dispatch: function dispatch(url, additionalParams, target) {
		if (typeof(url) == 'object') {
			url = this.__extractParams(url, additionalParams);
		} else {
			this.params = ActiveSupport.extend(this.parseParams(url), additionalParams || {});
		}

		this.here = url;

		var controller = this.__getController(target);

		if (!controller) {
			ActiveSupport.throwError(Dispatcher.Errors.MissingController, ActiveSupport.camelize(this.params.controller), 'Controller');
		}

		var privateAction = this.params.action.charAt(0) == '_';

		if (privateAction) {
			ActiveSupport.throwError(Dispatcher.Errors.PrivateAction, ActiveSupport.camelize(this.params.controller), 'Controller.', this.params.action);
		}

		controller.params = this.params;
		controller.action = this.action;

		return this._invoke(controller, this.params);
	}, 

	__extractParams: function __extractParams(url, additionalParams) {
		var defaults = {pass: [], form: {}};
		var params = ActiveSupport.extend(defaults, url);
		var params = ActiveSupport.extend(params, additionalParams || {});
		this.params = params;

		return Router.url(url);
	}, 

	parseParams: function parseParams(url) {
		var params = Router.parse(url);

		if (!params.action) {
			params.action = 'index';
		}

		return params;
	}, 

	__getController: function __getController(target) {
		var controller = false;
		var ctrlClass = this.__loadController(this.params);

		if (!ctrlClass) {
			return controller;
		}

		var params = this.params;

		var name = ctrlClass;
		ctrlClass += 'Controller';
		var global_context = ActiveSupport.getGlobalContext();

		return new global_context[ctrlClass](target);
	}, 

	__loadController: function __loadController(params) {
		var controller = null;

		if (params.controller) {
			this.params.controller = params.controller;
			controller = ActiveSupport.camelize(params.controller);
			controller = controller.charAt(0).toUpperCase() + controller.substring(1);
		}

		var global_context = ActiveSupport.getGlobalContext();

		if (global_context[controller + 'Controller']) {
			return controller;
		}

		return false;
	}, 

	_invoke: function _invoke(controller, params) {
		if (!controller[params.action]) {
			ActiveSupport.throwError(Dispatcher.Errors.MissingAction, ActiveSupport.camelize(this.params.controller), 'Controller.', this.params.action);
		}

		controller[params.action].apply(controller, params.pass);
	}
};

var Errors = {
	MissingController: ActiveSupport.createError('Missing Controller: '), 
	MissingAction: ActiveSupport.createError('Missing Action: '), 
	PrivateAction: ActiveSupport.createError('Private Action: ')
}
Dispatcher.Errors = Errors;

})();