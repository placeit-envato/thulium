Class('EjsProcessor')({

    result : function( templateString, context ){
        return new EJS( { text: templateString } ).render( context );
    }

});
