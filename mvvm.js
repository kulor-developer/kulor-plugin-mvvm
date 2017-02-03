/**
 * Created by chengbo on 17/1/24.
 */
define( "Mvvm" , [
    "Base" ,
    "Template" ,
    "EventBind"
] , function( Base , Template , EventBind ) {
    var RegExpKey = /<\w+\s[^>|^\{]*(\{\{[^\}]*\}\})+/gi ,
        Mvvm      = Base.extend( function( componentName , componentTemplateId , opt ) {
            if( !this.componentHashList[ componentName ] ) {
                this.componentName = componentName;
                this.componentTemplateId = componentTemplateId;
                document.registerElement( componentName , {
                    prototype : $.extend( Object.create( HTMLElement.prototype ) , {
                        createdCallback : function() {
                            this.innerHTML = "";
                        }
                    } )
                } );
                this.diffComponentInputs( componentName , componentTemplateId );
            }
        } , {
            implements                 : [ new Template() ] ,
            diffComponentInputHashList : {} ,
            componentHashList          : {} ,
            componentId                : 0 ,
            inputIndex                 : 0 ,
            diffComponentInputs        : function( name , templateId ) {
                var _html ,
                    _content ,
                    _self         = this ,
                    _inputKeyList = {};
                if( !this.diffComponentInputs[ name ] ) {
                    _html = this.getTemplateSources().getTemplateIdList( templateId );
                    _content = _html.TemplateContent.replace( RegExpKey , function( key ) {
                        _key = key.replace( /.*\{\{(.*)\}\}.*/ , "$1" );
                        _inputKeyList[ _key ] = [];
                        return key.replace( /<(\w+)/ , "<$1 data-mvvm-key='" + _key + "' data-mvvm-index=" + ++_self.inputIndex );
                    } );
                    _content = _content.replace( /<[^>|^\{]*>[^>]*(\{\{[^\}]*\}\})+[^>]*<\/[^>]*>/gi , function( key ) {
                        var _html ,
                            _hasKey = false;
                        key.replace( /\{\{([^\{|^\}]*)\}\}/g , function( k ) {
                            var _key = k.replace( /\{\{([^\{|^\}]*)\}\}/ , "$1" );
                            if( _inputKeyList[ _key ] ) {
                                _html = key.replace( /<[^>]+>([^<]*)<\/[^>]+>/ , "$1" );
                                _inputKeyList[ _key ].push( {
                                    inputIndex : ++_self.inputIndex ,
                                    template   : _html ,
                                    handleBar  : Handlebars.compile( _html )
                                } );
                                _hasKey = true;
                            }
                            return k;
                        } );
                        if( _hasKey ) {
                            return key.replace( /<(\w+)/ , "<$1 data-mvvm-index=" + _self.inputIndex );
                        } else {
                            return key;
                        }
                    } );
                    this.diffComponentInputHashList[ name ] = {
                        name         : templateId ,
                        html         : _html.TemplateContent ,
                        inputKeyList : _inputKeyList ,
                        handleBar    : Handlebars.compile( _content )
                    };
                }
                return this;
            } ,
            clone                      : function( prop ) {
                var _dom = document.createElement( this.componentName );
                this.setProp( _dom , prop );
                _dom.dataset.mvvmId = ++this.componentId;
                this.componentHashList[ this.componentId ] = _dom;
                _dom.__inputKeyList = this.diffComponentInputHashList[ this.componentName ].inputKeyList;
                return _dom;
            } ,
            render                     : function( dom ) {
                var _self = this ,
                    _str;
                window.setTimeout( function() {
                    _str = _self.diffComponentInputHashList[ _self.componentName ].handleBar( dom.__prop );
                    dom.innerHTML = _str;
                } , 0 );
            } ,
            setProp                    : function( dom , prop ) {
                var _self = this ,
                    _t    = false;
                dom.prop = {};
                dom.__prop = prop;
                for( var a in prop ) {
                    (function( key ) {
                        dom.prop.__defineSetter__( key , function( v ) {
                            dom.__prop[ key ] = v;
                            window.clearTimeout( _t );
                            _t = window.setTimeout( function() {
                                _self.render( dom );
                            } , 0 );
                        } );
                        dom.prop.__defineGetter__( key , function() {
                            return dom.__prop[ key ];
                        } );
                    })( a );
                }
                this.render( dom );
                return this;
            }
        } );
    new EventBind( {
        "input[data-mvvm-key] , textarea[data-mvvm-key]::keyup blur" : function() {
            var _$input     = $( this ) ,
                _$container = _$input.parents( "[data-mvvm-id]" ) ,
                _id         = _$container.data( "mvvm-id" ) ,
                _key        = this.dataset.mvvmKey ,
                _val        = this.value ,
                _dom        = Mvvm.prototype.componentHashList[ _id ] ,
                _inputList  = _dom.__inputKeyList[ _key ];
            _dom.__prop[ _key ] = _val;
            if( _inputList ) {
                for( var i = _inputList.length; i--; ) {
                    _$container.find( "[data-mvvm-index]" ).each( function() {
                        var _index = this.dataset.mvvmIndex;
                        if( _index == _inputList[ i ].inputIndex ) {
                            this.innerHTML = _inputList[ i ].handleBar( _dom.__prop );
                        }
                    } );
                }
            }
        }
    } , $( document.body ) , {} );
    return Mvvm;
} );