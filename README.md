# kulor-plugin-mvvm

html:
```
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
    <p>
        <a func="submit">提交</a>
    </p>
</script>
```

js:
```
let XHello   = new Mvvm( "x-hello" , "XHelloTemplate" , {} ) ,
    _xhello  = XHello.clone( {
        name      : "John" ,
        age       : 18 ,
        title     : "world!!" ,
        content   : "" ,
        openClass : ""
    } ) ,
    _xhello2 = XHello.clone( {
        name      : "John Simth" ,
        age       : 21 ,
        title     : "someThing!!" ,
        content   : "xxxxx" ,
        openClass : "on"
    } );
this.prop.xhello = _xhello;
$( document.body ).html( _xhello )
    .append( _xhello2 );
````