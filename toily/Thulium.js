var Tm = Class('Thulium')({
    prototype : {    
        
        _templateChunk : [],

        init : function( template ){
            this.template = template;
            return this;
        },

        compile : function(){
            //delegate printing and executing actions
            return this.parse( this.template );

            // var myCustomFunc = new Function('var i = 1; return i+1;');
            
            // console.log( myCustomFunc() );
            
            // return 'compile';
        },

        parse : function( template ){
            
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
                        this.printText( buffer );

                        //flag printable
                        wasPrintable = true;
                        
                        //reset buffer
                        buffer = currentChar;
                        lookForOpen = false;

                    //is executable
                    } else if( (currentChar + next) == '<%' ) {
                        //print current buffer
                        this.printText( buffer );

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
                            this.prinTableCode( buffer + '%>' );

                            //reset buffer
                            buffer = '';

                            //continue open bracket search
                            lookForOpen = true;

                            //update iterator counter
                            i = i+2;

                        //was exec code
                        } else {
                            //update open tag Counter
                            if( openTagCounter > 0 ) {
                                openTagCounter--;
                            }

                            //All tags closed proceed to exectute code
                            if( openTagCounter === 0 && openBracketCounter === 0){                                
                                //delegate executable code
                                this.executableCode( buffer + '%>' );
                                
                                //reset buffer
                                buffer = '';

                                //continue open bracket search
                                lookForOpen = true;                            
        
                                //update iterator counter
                                i = i+2;

                            //not all tags and brackets closed continue buffering
                            }else{
                                buffer += currentChar;
                            }
                            
                        }


                    //is normal code, add to buffer
                    } else {
                         
                        //Build executable block
                        //look for open tags
                        if( (currentChar + next) == '<%' || (currentChar + next + third) == '<%=' ){
                            openTagCounter++;
                        }

                        // look open bracket
                        if( wasPrintable === false ){
                            if( currentChar == '{' ){
                                openBracketCounter++;
                            }

                            if( currentChar == '}' ){
                                openBracketCounter--;
                            }
                        }

                        //buffering
                        buffer += currentChar;
                    }                    
                }

            }

            return this._templateChunk;
        },

        printText : function( normalTextTemplate ){
            this._templateChunk.push({
                type  : 'text',
                value : normalTextTemplate
            });

            return this;
        },

        prinTableCode : function( printableCode ){
            this._templateChunk.push({
                type  : 'print',
                value : printableCode
            });

            return this;
        },

        executableCode : function( executableCode ){
            this._templateChunk.push({
                type  : 'code',
                value : executableCode
            });

            return this;
        }
    }
});