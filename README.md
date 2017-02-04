# kulor-plugin-mvvm

html:
```
<script type="text/kulor-template" id="XHelloSonTemplate">
    <h1>{{name}}</h1>
    <h2>{{age}}</h2>
</script>

<script type="text/kulor-template" id="XHelloTemplate">
    <h1>Hello {{title}}</h1>
    <h2>my name is {{name}}</h2>
    <h3>age is {{age}}</h3>
    <p>tell me something</p>
    <p class="is-input {{openClass}}">
        <input value="{{content}}">
    </p>
    <p>copy : {{content}}</p>
    <p>copy-to : {{content}}-{{name}}</p>
    <strong>to : {{name}}</strong>
    {{{setLeafDom xhelloSon}}}
    <p>
        <a func="submit">提交</a>
    </p>
</script>
```

js:
```
require( [
    "Mvvm"
] , ( Mvvm )=> {
    let XHello     = new Mvvm( "x-hello" , "XHelloTemplate" , {} ) ,
        _xhelloSon = new Mvvm( "x-hello-son" , "XHelloSonTemplate" , {} ).clone( {
            name  : "son of John" ,
            age   : 10 ,
            title : "Haha!!"
        } ) ,
        _xhello    = XHello.clone( {
            name      : "John" ,
            age       : 18 ,
            title     : "world!!" ,
            content   : "" ,
            openClass : ""
        } ) ,
        _xhello2   = XHello.clone( {
            name      : "John Simth" ,
            age       : 21 ,
            title     : "someThing!!" ,
            content   : "xxxxx" ,
            openClass : "on" ,
            friends   : [
                { scontent : "1" } ,
                { scontent : "2" } ,
                { scontent : "3" } ,
                { scontent : "4" } ,
                { scontent : "5" }
            ] ,
            xhelloSon : _xhelloSon
        } );
    $( ".container" ).html( _xhello )
        .append( _xhello2 );
    window.$xhello = _xhello2;
    window.$xhelloSon = _xhelloSon;
    return this;
} );
````