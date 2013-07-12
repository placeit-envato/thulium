/**
* Class DSL
* This files provides a dsl for the following design patterns:
* inheritance, interface, module.
*
* It also provides a dsl for class creation.
*
* The phylosophy is that it should not try to emulate other languages,
* and it preserves the javascript good parts, but with a nicer syntax to
* create classes that ensure interfaces and include reusable functionality as modules.
*
* Author: Fernando Trasviña
*
* Usage:
* Interface('Editable')({
* 	constructor : ['x'],
* 	prototype   : ['x']
* });
*
* Module('Composition')({
* 	y : 5,
* 	prototype : {
* 		z : 3
* 	}
* });
*
* Module('Other')({
* 	a : 5,
* 	prototype : {
* 		b : 3
* 	}
* });
*
* Class('Overlay').inherits(Widget).ensures(Editable).includes(Composition, Other)({
* 	html : '<div></div>',
* 	prototype : {
* 		init : function (element){
* 			if(!element){
* 				element = document.createElement('div');
* 				element.innerHTML = 'hola';
* 				document.body.appendChild(element);
* 			}
* 		},
* 		b : 5
* 	}
* });
*/
var Interface = function Interface(nameOrNameSpace, name){
	var nameSpace, interfaceName, factory;
	nameSpace                  = (nameOrNameSpace && name) ? nameOrNameSpace : this;
	interfaceName              = (nameOrNameSpace && name) ? name :
	(nameOrNameSpace) ? nameOrNameSpace : 'interface' + Math.random().toString();
	factory = function(definition){
		definition.isInterface   = true;
		definition.name          = interfaceName;
		nameSpace[interfaceName] = definition;
		return nameSpace[interfaceName];
	};
	return factory;
};

var Module = function Module(nameOrNameSpace, name) {
    var nameSpace, moduleName, factory, newModule;
    
    nameSpace = (nameOrNameSpace && name) ? nameOrNameSpace : this;
    moduleName = (nameOrNameSpace && name) ? name :
    (nameOrNameSpace) ? nameOrNameSpace : 'module' + Math.random().toString();
    
    newModule = {
        moduleName : moduleName,
        prototype : {},
        __includedModules : [],
        include : function(module) {
            var property;
            for (property in module) {
                if (module.hasOwnProperty(property)
                && property !== 'prototype'
                && property !== 'isModule'
                && property !== '__includedModules'
                && property !== 'include'
                && property !== 'moduleName') {
                    newModule[property] = module[property];
                }
            }
            
            if (module.hasOwnProperty('prototype') && module.prototype) {
                for (property in module.prototype) {
                    if (module.prototype.hasOwnProperty(property)) {
                        newModule.prototype[property] = module.prototype[property];
                    }
                }
            }

            this.__includedModules.push(module);
            
            return this;
        }
    };
    
    factory = function(definition){
        var property;
        
        newModule.isModule = true;
        
        for (property in definition) {
            if (definition.hasOwnProperty(property)
                && property !== 'prototype'
                && property !== 'isModule'
                && property !== '__includedModules'
                && property !== 'include'
                && property !== 'moduleName') {
                newModule[property] = definition[property];
            }
        }
        
        if (definition.hasOwnProperty('prototype') && definition.prototype) {
            for (property in definition.prototype) {
                if (definition.prototype.hasOwnProperty(property)) {
                    newModule.prototype[property] = definition.prototype[property];
                }
            }
        }
        
        nameSpace[moduleName] = newModule;
        
        return nameSpace[moduleName];
    };
    
    factory.includes = function () {
        for(var i = 0; i < arguments.length; i++){
            newModule.include(arguments[i]);
        }
        return factory;
    };
    
    return factory;
};

var Class = function Class(classNameOrNameSpace, className){
	var nameSpace, newClass, classFactory;
	nameSpace                  = (classNameOrNameSpace && className) ? classNameOrNameSpace : this;
	className                  = (classNameOrNameSpace && className) ? className :
	(classNameOrNameSpace) ? classNameOrNameSpace : 'class' + Math.random().toString();
	newClass                   = function(){
		if(this.init){
            // if (this.constructor.__instances && !this.constructor.__instances.length) {
            //     this.constructor.__instances = [];
            // }
            // this.constructor.__instances = this.constructor.__instances || [];
            // this.constructor.__instances.push(this);
			this.init.apply(this, arguments);
		}
	};

	newClass.__descendants           = [];
	newClass.__implementedInterfaces = [];
	newClass.__includedModules       = [];
	newClass.className               = className;
	newClass.include                 = function(module){
		var property;
		for(property in module){
			if (module.hasOwnProperty(property) 
			        && property != 'prototype' 
			        && property != 'constructor' 
			        && property != 'isModule' 
                    && property != 'include'
			        && property != 'superClass') {
				newClass[property] = module[property];
			}
		}

		if(module.hasOwnProperty('prototype') && module.prototype){
			for(property in module.prototype){
				if(module.prototype.hasOwnProperty(property)){
					newClass.prototype[property] = module.prototype[property];
				}
			}
		}else{
			module.prototype = {};
		}

		newClass.__includedModules.push(module);
		return this;
	};

	classFactory = function(classDefinition){
		var i, il, j, jl, property, classPrototype = classDefinition.prototype;
		if(classPrototype){
			for(property in classPrototype){
				if(classPrototype.hasOwnProperty(property)){
					newClass.prototype[property] = classPrototype[property];
				}
			}
			delete classDefinition.prototype;
		}
		for(property in classDefinition){
			if(classDefinition.hasOwnProperty(property)){
				newClass[property] = classDefinition[property];
			}
		}

		for(i = 0, il = newClass.__implementedInterfaces.length; i < il; i++){
			for(j = 0, jl = newClass.__implementedInterfaces[i].constructor.length; j < jl; j++){
				if(!newClass[ newClass.__implementedInterfaces[i].constructor[j] ]){
					alert('must implement static ' + newClass.__implementedInterfaces[i].name);
					break;
				}
			}

			if(newClass.__implementedInterfaces[i].hasOwnProperty('prototype') 
			&& newClass.__implementedInterfaces[i].prototype){
				for(j = 0, jl = newClass.__implementedInterfaces[i].prototype.length; j < jl; j++){
					if(!newClass.prototype[newClass.__implementedInterfaces[i].prototype[j]]){
						alert('must implement prototype ' + newClass.__implementedInterfaces[i].name);
						break;
					}
				}
			}
		}

        if (window.Li && window.Li.ObjectSpy && window.Li.Spy) {
            newClass.__objectSpy = new Li.ObjectSpy();
            newClass.__objectSpy.spy(newClass);
            newClass.__objectSpy.spy(newClass.prototype);
        }

		nameSpace[className] = newClass;
		return newClass;
	};

	classFactory.inherits = function(superClass){
		var i, inheritedClass;
		newClass.superClass            = superClass;
		if(superClass.hasOwnProperty('__descendants')){
			superClass.__descendants.push(newClass);
		}
		inheritedClass                 = function(){};
		inheritedClass.prototype       = superClass.prototype;
		newClass.prototype             = new inheritedClass();
		newClass.prototype.constructor = newClass;

		for(i in superClass){
			if (superClass.hasOwnProperty(i) 
                    && i != 'prototype' 
                    && i !== 'className' 
                    && i !== 'superClass' 
                    && i != '__descendants'
                    && i != 'include') {
				newClass[i] = superClass[i];
			}
		}

		delete this.inherits;
		return this;
	};

	classFactory.ensures = function(interfaces){
		for(var i = 0; i < arguments.length; i++){
			newClass.__implementedInterfaces.push(arguments[i]);
		}
		delete this.ensures;
		return classFactory;
	};

	classFactory.includes = function(){
		for(var i = 0; i < arguments.length; i++){
			newClass.include(arguments[i]);
		}
		return classFactory;
	};

	return classFactory;
};
