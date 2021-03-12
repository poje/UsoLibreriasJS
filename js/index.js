//Valores Default Select2

//Siempre debería ir el document.ready, de esta manera nos aseguramos de que se encuentre todo renderizado cuando vayamos a trabajar
//podemos añadir async para trabajar con funciones asincronas
$(document).ready(async function() {
    console.log("dentro de Document Ready");

    seccionSelect2();
    seccionDataTables();
    seccionMoment();

    //aqui instanciamos el maxLength, hay options que permiten personalizar el mensaje y el estilo
    //la documentación esta aqui http://keith-wood.name/maxlength.html
    //pero con esto basta para que se muestre un mensaje por defecto
    $("#textareaTest").maxlength({max:50})


});

console.log("Fuera de Document Ready");

function seccionMoment(){
    //Con momentJS podemos trabajar con fechas - Documentación en https://momentjs.com/
    //Se pueden hacer calculos de fechas, formatear fechas, etc.
    console.log(moment().format("DD-MM-YYYY"));
}


async function seccionDataTables(){
    //este plugin es el que te había contado para trabajar con tablas, esta es su página https://datatables.net/
    //hay muchos ejemplos, solo te mostraré lo que nos ha tocado armar.

    //Lo primero es tener creada la tabla html con un formato que se debe cumplir si o si
    // <table id="tablaEjemplo">
    //     <thead>
    //         <th></th> //Aqui se agregan los th por cada columna que tengas
    //     </thead>
    //     <tbody></tbody>
    // </table>

    //instancia básica con todas las opciones por defecto
    //hay un monton de opciones, acá mostraré solo las que usamos principalmente, todo depende de lo que necesites armar
    // const table = $("#tablaEjemplo").DataTable();


    var datosPaises = await GetPaisesFetch();
    // console.log(datosPaises);
    //Ahora agregaremos algunas opciones que usamos de manera más común
    //para que funcione el options buttons, se debe añadir un js más que se encuentra en la página de DataTables - Extensions - Buttons
    const table = $("#tablaEjemplo").DataTable({
        pageLength: 10,
        autoWidth: false,
        paging: true,
        lengthChange: true,
        pagingType: "numbers",
        ordering: false,
        info: true,
        cache: false,
        searching: true,
        destroy: true,
        language:{
            search: "Buscar",
            lengthMenu: "Mostrar _MENU_ registros por página",
            zeroRecords: "No se han encontrado registros",
            info: "Mostrando página _PAGE_ de _PAGES_",
            infoEmpty: 'No se han encontrado resultados'
        },
        dom: "Bfrtip",
        buttons: [
            {
                extend: "excelHtml5",
                dom: "<'floatRight'B><'clear'>frtip",
                text: "<i class='fa fa-file-excel-o'></i> Exportar Excel",
                exportOptions: {
                    columns: ":visible"
                }
            }
        ],
        createdRow: (row, data, index) => {
        },
        //Podemos renderizar de manera personalizada en la tabla con el siguiente option columnDefs
        //los targets indican la posición en la tabla html
        //por ejemplo, si usamos el target 3, haría la modificación en la cuarta columna de la fila al renderizar
        //en el caso de los negativos, comienzan desde el final de la tabla hacia atras, por tanto el -1 sería el último y el -2 el penultimo
        //para estos efectos debemos tener creada la columna en el html, sino, 
        //nos arrojara una excepción diciendo que hay problemas en el row y en la column indicada
        columnDefs: [
            {
              targets: 3,
              render: function (data, type, row) {
                  //Con data accedemos al valor que viene en esta posición de la tabla (en este caso trae la url de la bandera)
                return `<img src="${data}" width="20px" height="20px" />`;
              }
            },
            {
                targets: -2,
                render: function(data, type, row){
                    return `<button class="descarga">Descargar</button>`
                }
            },
            {
                targets: -1,
                render: function(data, type, row){
                    return `<button class="eliminar">Eliminar</button>`
                }
            }
          ]
    });

    //Agregamos los datos a la tabla
    $.each(datosPaises, (index, pais) => {
        table.row.add([
            pais.alpha3Code,
            pais.name,
            pais.capital,
            pais.flag,
            pais.subregion
        ]).draw(false);
    });

    //podemos añadir diferentes eventos a la grilla
    //En la grilla de ejemplo tenemos descargar y eliminar (2 eventos)
    //podemos asociar a los selectores que necesitamos para trabajar

    $("#tablaEjemplo tbody").on("click", ".descarga", function(e) {
        e.preventDefault();

        alert("click en descargar");

        //Aqui ya podemos añadir lógica para trabajar
        //podríamos añadir una ajax que traiga un archivo por ejemplo, para eso necesitariamos los datos del tr
        const data = table.row($(this).parents("tr")).data();
        console.log(data);

        //Aqui con los datos ya podríamos trabajar
    });

    $("#tablaEjemplo tbody").on("click", ".eliminar", function(e) {
        e.preventDefault();

        alert("click en eliminar");

        //para eliminar necesitariamos acceder al id de la fila
        const data = table.row($(this).parents("tr")).data();
        console.log(data[0]); //id

        //Agregar logica para eliminar
    });

}

function seccionSelect2(){

    //Select2 es una librería que nos permite entregar propiedades avanzadas a nuestros <select></select>
    //Depende de Jquery para funcionar, 
    //Documentación con muchos más detalles en https://select2.org/
    cargaDropdownPaisesAxios();
    cargadropdownPaisesFetch();
    cargaDropdownPaisesAjax();

    // Deshabilitar Select2
    $("#selectAjax").prop("disabled", true);

    //Habilitar Select 2
    $("#selectFetch").prop("disabled", false);
}


async function cargaDropdownPaisesAxios(){
    // Docuemntación de axios https://github.com/axios/axios
    var result = await axios.get('https://restcountries.eu/rest/v2/all');

    // console.log(result.data);

    //Aqui instanciamos un select2 con opciones sencillas
    //Se pueden hacer templates personalizados, dejo un ejemplo :)

    $("#selectAxios").select2({
        width:"100%",
        placeholder: { 
            id: 0,
            text:'Select an option'
        },
        //Aca hacemos un map para recorrer el array de datos obtenido y cargando la lista de registros que apareceran en el <select>
        data: $.map(result.data, obj => {
            obj.id = obj.id || obj.alpha3Code;
            obj.text = obj.text || obj.name;

            return obj;
        }),
        //Nos permite mostrar una 'X' para que puedan resetear el <select> y elegir un nuevo valor
        allowClear: true,
        templateResult: templateWithFlags,
        templateSelect: templateWithFlags
    }).on("select2:select", function(e){
        //también podemos acceder al dato seleccionando usando este evento propio del control Select2
        //En la página salen todos los eventos, también sale un log de ejecución de los eventos
        //por ejemplo el evento .on("change") se ejecuta antes que el on("select2:select")
        //se pueden hacer cosas distintas en ambos eventos ;)
        var data = e.params.data;
        console.log('data select2:select', data.id);
    });

    //Si quisieramos agregar una nueva opción al <select> 
    // var option = {
    //     alpha3Code: 'jrg',
    //     name: 'Jorge Island'
    // };

    //Creamos una instancia de nueva option 
    // var newOption = new Option(option.name, option.alpha3Code, false, false);

    //añadimos y ejecutamos el cambio 
    // $("#selectAxios").append(newOption).trigger('change');

    //Con esta linea podemos seleccionar un valor  
    // $("#selectAxios").val('CHL');

    //Y con esta linea notificamos que el valor del select cambio 
    //esto también provoca que se ejecute el evento relacionado al control <select> "change"
    //También lo podemos hacer como el anterior $("#selectAxios").val('CHL').trigger('change');

    // $("#selectAxios").select2().trigger('change'); 


    //para limpiar el <select> lo debemos hacer de la siguiente manera
    // $("#selectAxios").val(null).trigger('change');

    //Destruir el select2
    // $("#selectAxios").select2('destroy');
}

function templateWithFlags(state){
    //state vendría siendo el objeto que se va a cargar a la descripción donde esta el texto del <select> 
    //es por ello que tenemos los datos como el id y el text
    if(!state.id){
        return state.text;
    }

    if (state.id ==="0"){
        return state.text;
    }

    let id = state.id.toLowerCase();
    let url = `https://restcountries.eu/data/${id}.svg`
    
    var $template = $(
        `<span><img class="img-flag" /></span>  ${state.text}<span></span> </span>`
    );
    
    $template.find("img").attr("src", url);
    $template.find("img").css("width", "20px");
    $template.find("img").css("height", "20px")

    return $template;
}

async function GetPaisesFetch(){
    var result = await fetch('https://restcountries.eu/rest/v2/all'); //con await hacemos que espere la respuesta desde la API
    var data = await result.json(); //con await esperamos que se transforme en json el resultado para poder trabajarlo

    return data;
}

//usando fetch tenemos el problema que al ser sincrono, hace todo rápido, sin esperar respuesta para poder trabajar
//para trabajar con fetch, deberemos usar siempre una función asincrona, de esta manera podemos indicarle que espere resultados antes de realizar acciones
async function cargadropdownPaisesFetch(){
    var result = await fetch('https://restcountries.eu/rest/v2/all'); //con await hacemos que espere la respuesta desde la API
    var data = await result.json(); //con await esperamos que se transforme en json el resultado para poder trabajarlo

    $("#selectFetch").select2({
        width:"75%",
        placeholder: { 
            id:0, 
            text:'Select an option'
        },
        data: $.map(data, obj => {
            obj.id = obj.id || obj.alpha3Code;
            obj.text = obj.text || obj.name;

            return obj;
        }),
        allowClear: true
    })
}

//Obtenemos datos utilizando Ajax, lo unico que ajax depende de jquery, de manera de que si en un proyecto no contamos con jquery, no podremos utilizarlo.
//Axios es una alternativa basada en promesas que puede ser un buen reemplazante si es que es requerido
function cargaDropdownPaisesAjax(){
    $.ajax({
        url:'https://restcountries.eu/rest/v2/all',
        type:'GET',
        dataType:'json',
        sucess: function() {
        },
        error: function(){
            
        }
    }).then(function(data){

        $("#selectAjax").select2({
            width: "50%",
            placeholder: { 
                id:0, 
                text:'Select an option'
            },
            data: $.map(data, obj => {
                obj.id = obj.id || obj.alpha3Code;
                obj.text = obj.text || obj.name;

                return obj;
            }),
            allowClear: true
        })
    });
}