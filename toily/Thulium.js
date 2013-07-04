var Tm = Class('Thulium')({
    prototype : {    
        
        _templateArray : [],
        _compiledTemplate : 'var _compiledSource = "", tm = this;\n',

        init : function( template ){
            this.template = template;
            return this;
        },

        process : function( params ){
            var paramNames  = [],
                paramValues = [];

            //Parse and build 
            this._parse( this.template );
            
            //Compile template array
            var compiledSource = this._compile();

            for( var paramName in params){
                paramNames.push( paramName );
                paramValues.push( params[paramName] );
            }
            
            console.log('---\n', compiledSource);

            var compiledFunction = new Function( paramNames, compiledSource );

            return compiledFunction.apply(this, paramValues);
        },

        _compile : function( params ){
            var tm = this;

            this._templateArray.forEach(function( partialNode ){
                
                switch (partialNode.type) {
                    case 'text':
                        tm._compiledTemplate += '_compiledSource += \''+ partialNode.value +'\';\n';
                    break;
                    case 'code':
                        tm._compiledTemplate += partialNode.value + '\n';
                    break;
                    case 'print':
                        tm._compiledTemplate += tm.printCode( partialNode.value );
                    break;
                }

            });

            this._compiledTemplate += 'return _compiledSource;';

            return this._compiledTemplate;
        },

        printCode : function( templateString ){

            return '_compiledSource += '+templateString+';\n';
            
        },

        _parse : function( template ){
            
            var lookForOpen  = true,
                wasPrintable = false,

                openBracketCounter = 0,
                openTagCounter     = 0,

                buffer = '',

                currentChar =  '',
                next    =  '',
                third   =  '';

            //waltk every character
            for( var i = 0; i<template.length ; i++ ){
                //start comparing
                currentChar = template[i];
                
                //create string for bracket lookup
                if( template[i+1] ){
                    next = template[i+1];
                    
                    if( template[i+2] ){
                        third = template[i+2];
                    }

                }

                //start looking for open bracket if there is no open one previously
                if ( lookForOpen ) {
                    //is printable
                    if( (currentChar + next + third) == '<%=' ) {
                        //print current buffer
                        this._printText( buffer );

                        //flag printable
                        wasPrintable = true;
                        
                        //reset buffer
                        buffer = currentChar;
                        lookForOpen = false;

                    //is executable
                    } else if( (currentChar + next) == '<%' ) {
                        //print current buffer
                        this._printText( buffer );

                        //flag exec
                        wasPrintable = false;

                        //reset buffer
                        buffer = currentChar;
                        lookForOpen = false;

                    //is normal add text to current buffer
                    } else {
                        buffer += currentChar;
                    }

                //looking for a closing bracket
                } else {

                    //look for closing bracket
                    if( (currentChar + next) == '%>' ) {
                        
                        //code was printable
                        if( wasPrintable ){
                            //print code
                            this._prinTableCode( buffer.replace('<%=','') );

                            //reset buffer
                            buffer = '';

                            //continue open bracket search
                            lookForOpen = true;

                            //update iterator counter
                            i = i+1;

                        //was exec code
                        } else {

                            //delegate executable code
                            this._executableCode( buffer.replace('<%','') );
                            
                            //reset buffer
                            buffer = '';

                            //continue open bracket search
                            lookForOpen = true;                            
    
                            //update iterator counter
                            i = i+1;
                        }


                    //is normal code, add to buffer
                    } else {
                        //buffering
                        buffer += currentChar;
                    }                    
                }

            }

            return this._templateArray;
        },

        _printText : function( normalTextTemplate ){
            this._templateArray.push({
                type  : 'text',
                value : normalTextTemplate.replace(/\n/g, '\\n')
            });

            return this;
        },

        _prinTableCode : function( printableCode ){
            this._templateArray.push({
                type  : 'print',
                value : printableCode.replace(/\n/g, '\\n')
            });

            return this;
        },

        _executableCode : function( executableCode ){
            this._templateArray.push({
                type  : 'code',
                value : executableCode.replace(/\n/g, '\\n')
            });

            return this;
        }
    }
});