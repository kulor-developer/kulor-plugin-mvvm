/**
 * Created by chengbo on 17/1/24.
 */
define( "Mvvm" , [
    "Base" ,
    "Template" ,
    "EventBind"
] , function( Base , Template , EventBind ) {
    var RegExpKey                  = /<\w+\s[^>|^\{]*(\{{2,3}[^\}]*\}{2,3})+/gi ,
        diffComponentInputHashList = {} ,
        componentHashList          = {} ,
        componentId                = 0 ,
        inputIndex                 = 0 ,
        cloneLeafDomId             = 0 ,
        Mvvm                       = Base.extend( function( componentName , componentTemplateId , opt ) {
            if( !componentHashList[ componentName ] ) {
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
            implements          : [ new Template() ] ,
            diffComponentInputs : function( name , templateId ) {
                var _html ,
                    _content ,
                    _inputKeyList = {};
                if( !this.diffComponentInputs[ name ] ) {
                    _html = this.getTemplateSources().getTemplateIdList( templateId );
                    _content = _html.TemplateContent.replace( RegExpKey , function( key ) {
                        _key = key.replace( /.*\{{2,3}(.*)\}{2,3}.*/ , "$1" );
                        _inputKeyList[ _key ] = [];
                        return key.replace( /<(\w+)/ , "<$1 data-mvvm-key='" + _key + "' data-mvvm-index=" + ++inputIndex );
                    } );
                    _content = _content.replace( /<[^>|^\{]*>[^>]*(\{{2,3}[^\}]*\}{2,3})+[^>]*<\/[^>]*>/gi , function( key ) {
                        var _html ,
                            _hasKey = false;
                        key.replace( /\{{2,3}([^\{|^\}]*)\}{2,3}/g , function( k ) {
                            var _key = k.replace( /\{{2,3}([^\{|^\}]*)\}{2,3}/ , "$1" );
                            if( _inputKeyList[ _key ] ) {
                                _html = key.replace( /<[^>]+>([^<]*)<\/[^>]+>/ , "$1" );
                                _inputKeyList[ _key ].push( {
                                    inputIndex : ++inputIndex ,
                                    template   : _html ,
                                    handleBar  : Handlebars.compile( _html )
                                } );
                                _hasKey = true;
                            }
                            return k;
                        } );
                        if( _hasKey ) {
                            return key.replace( /<(\w+)/ , "<$1 data-mvvm-index=" + inputIndex );
                        } else {
                            return key;
                        }
                    } );
                    diffComponentInputHashList[ name ] = {
                        name         : templateId ,
                        html         : _html.TemplateContent ,
                        inputKeyList : _inputKeyList ,
                        handleBar    : Handlebars.compile( _content )
                    };
                }
                return this;
            } ,
            clone               : function( prop ) {
                var _dom = document.createElement( this.componentName );
                _dom.dataset.mvvmId = ++componentId;
                this.setProp( _dom , prop );
                componentHashList[ componentId ] = _dom;
                _dom.__inputKeyList = diffComponentInputHashList[ this.componentName ].inputKeyList;
                this.render( _dom );
                _dom.__selfMvvm = this;
                return _dom;
            } ,
            render              : function( dom , isLeafDom ) {
                var _self = this ,
                    _str ,
                    _tmpDom ,
                    _render     = function(){
                        _str = diffComponentInputHashList[ _self.componentName ].handleBar( dom.__prop );
                        dom.innerHTML = _str;
                    };
                window.setTimeout( function() {
                    if( !dom.__prop.__leafDom.parentDom ) {
                        _render();
                    } else if( isLeafDom ) {
                        _tmpDom     = document.getElementById( dom.id );
                        _tmpDom.parentNode.replaceChild( dom , _tmpDom );
                        _render();
                    }
                } , 0 );
            } ,
            setProp             : function( dom , prop ) {
                var _self = this ,
                    _t    = false;
                dom.prop = {};
                dom.__prop = Object.create( prop );
                dom.__prop.__leafDom = {};
                for( var a in prop ) {
                    if( prop[ a ] instanceof HTMLElement ) {
                        dom.__prop.__leafDom[ a ] = prop[ a ];
                        prop[ a ].__prop.__leafDom.parentDom = dom;
                    }
                    (function( key ) {
                        dom.prop.__defineSetter__( key , function( v ) {
                            dom.__prop[ key ] = v;
                            window.clearTimeout( _t );
                            _t = window.setTimeout( function() {
                                _self.render( dom , true );
                            } , 0 );
                        } );
                        dom.prop.__defineGetter__( key , function() {
                            return dom.__prop[ key ];
                        } );
                    })( a );
                }
                return this;
            }
        } );

    Handlebars.registerHelper( "setLeafDom" , function( dom ) {
        if( !( dom instanceof HTMLElement ) ) {
            return "";
        }
        if( dom.__prop.__leafDom.parentDom ) {
            dom.id = "mvvm-" + +new Date + "-" + ++cloneLeafDomId + "'";
            dom.__selfMvvm.render( dom , true );
        }
        return dom.outerHTML;
    } );

    new EventBind( {
        "input[data-mvvm-key] , textarea[data-mvvm-key]::keyup blur" : function() {
            var _$input     = $( this ) ,
                _$container = _$input.parents( "[data-mvvm-id]" ) ,
                _id         = _$container.data( "mvvm-id" ) ,
                _key        = this.dataset.mvvmKey ,
                _val        = this.value ,
                _dom        = componentHashList[ _id ] ,
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