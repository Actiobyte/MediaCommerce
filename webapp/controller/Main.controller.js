sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Label",
    "sap/m/MessageToast",
    "sap/m/Text",
    "sap/ui/core/ValueState",
    "sap/ui/layout/VerticalLayout",
    "sap/m/ObjectStatus",
    "sap/m/MultiInput",
    'sap/m/Token',
    "sap/ui/core/Core",
    "sap/m/DatePicker"



],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller, BaseController, JSONModel, Filter, FilterOperator, Dialog, DialogType, Button, ButtonType, Label, MessageToast, Text, ValueState,VerticalLayout,ObjectStatus,MultiInput,Token,Core,DatePicker) {
        "use strict";

        return BaseController.extend("mc.consumomateriales.controller.Main", {




            _filters: [],
            onInit: function () {

                this.RSNUM = "Rsnum";
                this.AUFNR = "Aufnr";


                var oViewModel = this._createViewModel();
                var oCrudModel = new JSONModel({
                    operations: []
                });

                var oMateriales = new JSONModel({
                    
                });




                this.setModel(oViewModel, "viewModel");
                this.setModel(oCrudModel, "crudModel");
                this.setModel(oMateriales, "materialesModel");


                //posciones // demo 

                var posiciones = [

                    {


                        "Rsnum": "0000000136",
                        "Rspos": "0003",
                        "Rsart": "",
                        "Bdart": "AR",
                        "Rssta": "",
                        "Xloek": "true",
                        "Xwaok": "true",
                        "Kzear": "true",
                        "Matnr": "25",
                        "Werks": "1000",
                        "Lgort": "",
                        "Prvbe": {
                        },
                        "Charg": {
                        },
                        "Plpla": {
                        },
                        "Sobkz": {
                        },
                        "Bdter": "2021-05-31T00:00:00",
                        "Bdmng": "3",
                        "Meins": "C/U",
                        "Shkzg": "H",
                        "Fmeng": "false",
                        "Enmng": "3",
                        "Enwrt": "306",
                        "Waers": "COP",
                        "Erfmg": "3",
                        "Erfme": "C/U",
                        "Plnum": {
                        },
                        "Banfn": {
                        },
                        "Bnfpo": "00000",
                        "Aufnr": "4000078",
                        "Sernr": {
                        },
                        "Bwart": "281",
                        "Ebeln": "",
                        "Ebelp": "00000",
                        "Vornr": "0010",
                        "Maktx": "POSTE EN FIBRA DE VIDRIO 18 M POR 750 KG",
                        "NameCentro": "Centro Pereira",
                        "Lgobe": "",
                        "Zcreate": "false",
                        "Zdelete": "false",
                        "Zupdate": "false"


                    }


                ];


                //   this.getModel("viewModel").setProperty("/materiales", posiciones);


                this._getMateriales();


                


            },
            onAfterRendering: function () {

                /*

                var b = this.getView().byId("SEARCH_FILTER").getContent()[0].getContent();

                $.each(b, function (index, item) {

                    if (item.sId.search("btnGo") !== -1) {

                        item.setText("Search");

                    }

                });

                */


            },




            /* =========================================================== */
            /* begin: internal events                                     */
            /* =========================================================== */


            onSearch: function () {


                //obtiene el tipo de operacion y numero 
                var filterInput = this.byId("_FilterType");
                var inputField = this.byId("_IDGenInput1")

                var number = inputField.getValue();

                var filter = filterInput.getSelectedKey();

                console.log("on get reserva")

                console.log(filter, number);
                inputField.setValueState(sap.ui.core.ValueState.None); // if the field is empty after change, it will go red
                inputField.setValueStateText("")



                if(number == "" || number == null){
                    inputField.setValueState(sap.ui.core.ValueState.Error)
                    inputField.setValueStateText("Campo Obligatorio")

                    return
                }
 


                this._getReserva(filter, number);




            },

            onAddPosition: function () {
                console.log('on Add  Position')

                this.onOpenAddDialog();


            },

            onDeletePosition: function (oEvent) {
                console.log('on delete  row', oEvent)

                //  var path = oEvent.getSource().getBindingContext("viewModel").getPath();
                //  console.log(path)

                var path = oEvent.getParameter('listItem').getBindingContext("viewModel").getPath();
                console.log(path)
                var idx = parseInt(path.substring(path.lastIndexOf('/') +1));



                var m = this.getModel("viewModel");

                var registro = m.getProperty(path)
                registro.Zdelete = true

                if (registro.Zcreate == false) {
                    //si el registro no es nuevo solo se cambia el flag


                    m.setProperty(path, registro)
                } else {

                    //si el registro es nuevo se elimina 
                    var d = m.getData().materiales;
                    d.splice(idx, 1);
                    m.setProperty("/materiales", d)


                }









                this._onQuickFilter();
                console.log(m)



            },

            onEditPosition: function (oEvent) {
                console.log('on edit  row', oEvent)
                var deleteRecord = oEvent.getSource().getBindingContext('viewModel').getObject();

                var path = oEvent.getSource().getBindingContext("viewModel").getPath();
                console.log(path)

                this._path=path;

                var oModel = this.getView().getModel("viewModel"); // set the alias here

                //funcion que actualia el record en tabla 

               // deleteRecord.Bdmng = 99
               console.log('currnet serial,',deleteRecord)
                 deleteRecord.tempSerial = deleteRecord.tempSerial ? deleteRecord.tempSerial : null
                 deleteRecord.Bdmng = parseInt(deleteRecord.Bdmng)

                oModel.setProperty(path, deleteRecord)
                oModel.setProperty("/selectedItem", deleteRecord)


                console.log(oModel)
                this._getUM(deleteRecord.Matnr)
                this._getCentros(deleteRecord.Matnr);
                this._getAlmacenes(deleteRecord.Werks);


                this._getSeriales(deleteRecord.Matnr, deleteRecord.Werks, deleteRecord.Lgort)



                this.onOpenDialog();
           
                //mostrar dialogo de edicion 







            },


            /** HANDLRES PARA ACTUALIZAR  */

            _getDialog : function () {
                // create dialog lazily
              /*
                if (this._oDialog) {
                    this._oDialog.destroy(true);
                    this._oDialog = null
                }
                */
                
                if (!this._oDialog) {
                   // create dialog via fragment factory
                   this._oDialog = sap.ui.xmlfragment("mc.consumomateriales.view.EditDialog", this);
                   // connect dialog to view (models, lifecycle)
                   this.getView().addDependent(this._oDialog);
                }
                return this._oDialog;
             },
             onOpenDialog : function () {
                this._getDialog().open();
             },
             onCloseDialog : function () {
                this._getDialog().close();
               
             },

             onConfirmUpdate :function(){


                this._getDialog().close();

                var oModel = this.getView().getModel("viewModel");
                var registro = oModel.getProperty("/selectedItem")

                registro.tempSerial =  sap.ui.getCore().byId('input012').getTokens();

                
                
                var Lgobe = sap.ui.getCore().byId("almacenInputEdit").getSelectedItem().getText();
              
                registro.Lgobe =  Lgobe

                console.log(sap.ui.getCore().byId('input012'));

                console.log('serial editado',registro.tempSerial)

                if (registro.Zcreate == false) {
                    //si el registro no es nuevo solo se cambia el flag

                    registro.Zupdate = true
                } 

                oModel.setProperty(this._path, registro)

                console.log('viewModel',oModel)

               

                this._getDialog().destroy(true);
                this._oDialog = null


             },



             /** HANDLRES PARA AGREGAR MATERIAL  */

             _getAddDialog : function () {
                // create dialog lazily
                if (this._oAddDialog) {
                    this._oAddDialog.destroy(true);
                    this._oAddDialog = null
                }
                
                if (!this._oAddDialog) {
                   // create dialog via fragment factory
                   this._oAddDialog = sap.ui.xmlfragment("mc.consumomateriales.view.AddDialog", this);
                   // connect dialog to view (models, lifecycle)
                   this.getView().addDependent(this._oAddDialog);
                  
                   /*
                   this.getView().byId("materialesInput").setFilterFunction(function(sTerm, oItem) {
                    return oItem.getText().match(new RegExp(sTerm, "i")) || oItem.getKey().match(new RegExp(sTerm, "i"));
                });
                */

                }
                return this._oAddDialog;
             },
             onOpenAddDialog : function () {
                this._getAddDialog().open();
             },
             onCloseAddDialog : function () {
                this._getAddDialog().close();
              },

             onConfirmAdd :function(){

                this._getAddDialog().close();

                var oModel = this.getView().getModel("viewModel");
                var items = oModel.getProperty("/selectedItem")
                var oEntry = {};

             

             },




             /***Hanlde  eventos  dialogo  */

             onSelectMaterial: function (oEvent){

                console.log('selection change')
 
                var key1 = oEvent.oSource.getSelectedKey();
                console.log(key1);

                 this._getUM(key1);
                 this._getCentros(key1);

             },


             onSelectCentro: function (oEvent){

                console.log('selection change')
                var oModel = this.getView().getModel("viewModel");
 
                var key1 = oEvent.oSource.getSelectedKey();

               // var oSelectedItem = oEvent.getParameter("selectedItem");
               // var oContext = oSelectedItem.getBindingContext("viewModel");

               var path = oEvent.oSource.getSelectedItem().getBindingContext("viewModel").getPath();

                console.log('print obj centro----------')
              
                var oCentro =  oModel.getProperty(path)
                console.log(oCentro)
                //se setea el campo sern al. objeto actual 
                
               // var registro = oModel.getProperty("/selectedItem")


               // registro.Sernr =  oCentro.Sernr ;


                 
                 this._getAlmacenes(key1);

             },


             //on select material 

             onSelectAmacen: function (oEvent) {


                var oModel = this.getView().getModel("viewModel");
                var registro = oModel.getProperty("/selectedItem")
                console.log('selection change almacen')
                var key1 = oEvent.oSource.getSelectedKey();

             

                sap.ui.getCore().byId('input012').removeAllTokens();
                registro.tempSerial =  sap.ui.getCore().byId('input012').getTokens();

                
                 
                this._getSeriales(registro.Matnr, registro.Werks, key1)
             },





             /****ON AGREGAR MATERIAL  */
             /************************ */

             onConfirmMaterial: function(){



                //obtengo los campos de cabecera 

                var m = this.getModel("viewModel");
                var d = m.getData().materiales;

                if(d.length == 0){


                    this._getAddDialog().close();
                    this.onErrorMessageDialog("Debe consultar un número de orden o reserva")

                    return
                }

                var Rsnum = d[0].Rsnum;
                var Aufnr= d[0].Aufnr;


                //Tomar  Charg y generar rspos 

                var Charg= d[0].Charg;

                //

                var Bdmng = sap.ui.getCore().byId("BdmngInput").getValue()
                var Bwart = sap.ui.getCore().byId("BwartInput").getValue()

                var Meins = sap.ui.getCore().byId("MeinsInput").getSelectedKey();


                //material 

                var Maktx = sap.ui.getCore().byId("materialesInput").getSelectedItem().getText();
                var Matnr = sap.ui.getCore().byId("materialesInput").getSelectedKey()


                //Werks

                var Werks = sap.ui.getCore().byId("WerksInput").getSelectedKey()
                var NameCentro = sap.ui.getCore().byId("WerksInput").getSelectedItem().getText();

                //sacar Sernr

                var path = sap.ui.getCore().byId("WerksInput").getSelectedItem().getBindingContext("viewModel").getPath();

                console.log('print obj centro----------')
              
                var oCentro =  m.getProperty(path)
               


               // registro.Sernr =  oCentro.Sernr ;


               var Lgobe = sap.ui.getCore().byId("almacenInput").getSelectedItem().getText();
               var Lgort = sap.ui.getCore().byId("almacenInput").getSelectedKey()


                


                console.log('add position')


                //validar campos vacios 




                //agregar registro nuevo 

                const max = d.reduce(function(prev, current) {
                    return (parseInt(prev.Rspos) > parseInt(current.Rspos)) ? prev : current
                })


                console.log(max)

                var repos = parseInt(max.Rspos) + 1



                var tempItem = {


                    "Rsnum": Rsnum,
                    "Rspos": repos.toString(),
                    "Rsart": "",
                    "Bdart": " ",
                    "Rssta": "",
                    "Xloek": " ",
                    "Xwaok": " ",
                    "Kzear": " ",
                    "Matnr": Matnr,
                    "Werks": Werks,
                    "Lgort": Lgort,
                    "Prvbe": {
                    },
                    "Charg": Charg,
                    "Plpla": {
                    },
                    "Sobkz": {
                    },
                    "Bdter": "2021-05-31T00:00:00",
                    "Bdmng": Bdmng,
                    "Meins": Meins,
                    "Shkzg": "H",
                    "Fmeng": " ",
                    "Enmng": "3",
                    "Enwrt": " ",
                    "Waers": " ",
                    "Erfmg": " ",
                    "Erfme": " ",
                    "Plnum": {
                    },
                    "Banfn": {
                    },
                    "Bnfpo": " ",
                    "Aufnr": Aufnr,
                    "Sernr": oCentro.Sernr,
                    "Bwart": Bwart,
                    "Ebeln": "",
                    "Ebelp": " ",
                    "Vornr": " ",
                    "Maktx": Maktx,
                    "NameCentro": NameCentro,
                    "Lgobe": Lgobe,
                    "Zcreate": true,
                    "Zdelete":false,
                    "Zupdate": false,
                    "tempSerial":[]


                }


 


                //var m = this.getModel("viewModel");
                //var d = m.getData().materiales;
                d.push(tempItem)
                m.setProperty("/materiales", d)

                //cerrar y refrescar 
               this._onQuickFilter();
                console.log(m)
                this._getAddDialog().close();
                

             },


















             //RESET FORM 

            onReset: function (oEvent) {

                var oModel = this.getView().getModel("viewModel"); // set the alias here
                oModel.setProperty("/materiales", [])

                var filterInput = this.byId("_FilterType");
                var inputField = this.byId("_IDGenInput1")

                var number = inputField.setValue('');

               // var filter = filterInput.getSelectedKey();


                //this.onSearch();

            },


           
         onPress: function(){

            var m = this.getModel("viewModel");
            var d = m.getData().materiales;

            if(d.length == 0){


                this._getAddDialog().close();
                this.onErrorMessageDialog("Debe consultar un número de orden o reserva")

                return
            }else{
                this._showEmailConfirmation();

            }
         },   


        /** HANDLE CONFIRM DIALOGS  */
        _showEmailConfirmation: function () {
            var me = this;
 
            if (!this.oEmailDialog) {

                var emailInput =    new MultiInput("emails", {
                    width: "100%",
                    showValueHelp: false,
                
                });

                var dateContainer = new DatePicker("fechaC",{
                    value: new Date(),
                    valueFormat:"yyyyMMdd",
                    displayFormat:"long",

                })

                	// add validator
			var fnValidator = function(args){
				var text = args.text;
                var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

				return mailregex.test(text) ? new Token({key: text, text: text}): null
			};

			emailInput.addValidator(fnValidator);



 
                this.oEmailDialog = new Dialog({
                    type: DialogType.Message,
                    title: "Confirmar Materiales",
                    content: [
                        new Label({
                            text: "Direcciones de correo electrónico",
                            labelFor: "emails"
                        }),
                     emailInput,
                     new ObjectStatus("messagelabel",{
                        text:"Seleccione almenos un correo electrónico",
                        state:sap.ui.core.ValueState.Warning,
                        icon:"sap-icon://warning",
                        visible: false

                    }),
                    new Label({
                        text: "Fecha de contabilización ",
                        labelFor: "fecha"
                    }),
                    dateContainer,
                    new ObjectStatus("messagelabelDate",{
                        text:"Seleccione Fecha de contabilizacion",
                        state:sap.ui.core.ValueState.Warning,
                        icon:"sap-icon://warning",
                        visible: false

                    }),
                
                
                ],
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "Aceptar",
                        press: function () {
                           
                            var tokens = Core.byId("emails").getTokens();
                            var messagelabel = Core.byId("messagelabel");
                            var messageFecha = Core.byId("messagelabelDate");

                            var dateC = Core.byId("fechaC").getValue();


                            if(tokens.length > 0 && dateC){
                                console.log("on enviar cambios")
                                messagelabel.setVisible(false)

                                me.oEmailDialog.close();
                                me._enviarCambios(tokens,dateC);
                           
                            //llama el metodo order aprove 
                                messageFecha.setVisible(false)
 
                             

                            }else{
                                if(tokens.length == 0){
                                messagelabel.setVisible(true)
                                }


                                if(!dateC){
                                messageFecha.setVisible(true)
                                }

                            }
 

                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancelar",
                        press: function () {
                            me.oEmailDialog.close();
                        }.bind(this)
                    })
                });
            }

            var oMultiInput2email = Core.byId("email");


                	// add validator
		/*
                    var fnValidator = function(args){
				var text = args.text;

				return new Token({key: text, text: text});
			};

            oMultiInput2email.addValidator(fnValidator);
            */

            this.oEmailDialog.open();
        },




            _enviarCambios: function (tokens,fecha) {


                ///sap/opu/odata/sap/ZPM_RESERVAS_SRV/Material_NSerializadoSet

                var oEntry = {};
                oEntry.FechaConta = fecha;
                oEntry.FechaDoc = "";
                oEntry.NumDocReferencia = "";
                oEntry.TextoCabecera = "";
                oEntry.ItemSet = [];
                oEntry.RetornoSet = [];
                oEntry.CorreoSet = tokens ? this._getEmails(tokens) : []

                var oModel = this.getView().getModel("viewModel"); // set the alias here
                var posiciones = oModel.getProperty("/materiales")




                if (posiciones.length == 0) {

                    //no hay posciones por mostrar 
 

                    return
                } else {
                    for (var item of posiciones) {

                        //coloca las pociones en la lista 

                        var tempItem = {
                            Rspos:item.Rspos,
                            Charg:item.Charg,
                            Material: item.Matnr,
                            Plant: item.Werks,
                            StgeLoc: item.Lgort,
                            MoveType: item.Bwart,
                            Orderid: item.Aufnr,
                             Bdmng: item.Bdmng.toString(),
                            Meins: item.Meins,
                            Rsnum: item.Rsnum,
                            Zcreate: item.Zcreate ? "X" : "",
                            Zdelete: item.Zdelete ? "X" : "",
                            Zupdate: item.Zupdate ? "X" : "",
                            SerialSet: item.tempSerial ? this.getseriales(item.tempSerial) : []

                        }
                        oEntry.ItemSet.push(tempItem)
                    }

                    //mostrar dialogo de confirmacion 
                    this.oApproveDialog = null

                    if (!this.oApproveDialog) {
                        this.oApproveDialog = new Dialog({
                            type: DialogType.Message,
                            title: "Confirmar",
                            content: new Text({ text: "¿Esta seguro de confirmar materiales?" }),
                            beginButton: new Button({
                                type: ButtonType.Emphasized,
                                text: "Confirmar",
                                press: function () {

                                    this._sendChanges(oEntry)
                                    this.oApproveDialog.close();
                                }.bind(this)
                            }),
                            endButton: new Button({
                                text: "Cancelar",
                                press: function () {
                                    this.oApproveDialog.close();
                                }.bind(this)
                            })
                        });
                    }

                    this.oApproveDialog.open();







                }







            },



            getseriales: function (seriales) {
                var array = []

                if(seriales.length == 0){
                    array = []

                }else{
                    for (var token of seriales) {

                        array.push({"Serialno":token.getText()}) 

                    }

                }

                return array

            },

            _getEmails: function (tokens) {
                var array = []

                if(tokens.length == 0){
                    array = []

                }else{
                    for (var token of tokens) {

                        array.push({"Email":token.getText()}) 

                    }

                }

                return array

            },


            /* =========================================================== */
            /* begin: internal methods                                     */
            /* =========================================================== */

             
           


            _createViewModel: function () {
                return new JSONModel({
                    isFilterBarVisible: false,
                    filterBarLabel: "",
                    delay: 0,
                    titleCount: 0,
                    noDataText: this.getResourceBundle().getText("masterListNoDataText"),
                    positions: [],
                    materiales: [],
                    edited: false,
                    selectedItem:{},
                    catalogo_um:[],
                    catalogo_seriales:[
                         
                    ],
                    catalogo_charg:[
                        {Charg:"NUEVO"},
                        {Charg:"USADO"}
                    ]
                });
            },


            _onQuickFilter: function () {
                var filters = [];


                filters.push(new Filter({
                    path: "Zdelete",
                    operator: FilterOperator.EQ,
                    value1: false
                }));
                var oBinding = this.byId("_IDGenTable1").getBinding("items")
                oBinding.filter(filters);
            },




            _addCrudOPeration: function (operation, obj) {



                //se agrega la operacion a la lista 

                //***si se agrega una poscion que no esta en la lista y luego se elimina no se guarda el registro delete , solo se elimina 
                //por que eso implicaria registrar para luego borrar en el back end 


                //si es un edit se guarda el objeto a modificar junto con el tipo de operacion a realizar 


                // si es un add se registra la operaicon y el objeto 


                // si es un delete se guarda el objeto tal cual solo con la  operacion delete  pero si es registro nuevo  se eilimna de la tabla tmeporal 






            },


            _clearCrudTable: function () {

                var oModel = this.getView().getModel("crudModel"); // set the alias here
                oModel.setProperty("/operations", [])



            },


            _sendChanges: function (oEntry) {

                //sap/opu/odata/sap/ZPM_RESERVAS_SRV/Material_NSerializadoSet


                console.log(oEntry);
                var me = this;



                var oModel = this.getModel("appModel");
                oModel.setUseBatch(false);
                 oModel.setHeaders({ "content-type": "application/json;charset=utf-8",	"X-Requested-With": "X" });
                var data = JSON.parse(JSON.stringify(oEntry))


                oModel.create("/Material_NSerializadoSet", data, {
                    success: function (oData, response) {
                        //oData -  contains the data of the newly created entry
                        //response -  parameter contains information about the response of the request (this may be your message)
                        console.log(oData);

                        var mensajes  = oData.RetornoSet.results
                        console.log(mensajes);
                        var mensaje = ""

                     



                        

                      
                        // colocar validaciones de mensajes 
                        // para reset 

                        var success = false

                        for (var item of mensajes) {
                            if(item.Type !== 'E' ){
                             
                            success = true
                        }
                    }



                    if(success){
                        me.onReset(null)
                      }
                        me.onSuccessMessageDialog(mensajes)



                    },

                    error: function (oError) {
                        //oError - contains additional error information.
                        console.log(oError.responseText);
                        me.onErrorMessageDialog(oError.responseText)



                    }
                });






            },


            _cancelChanges: function () {


            },



            _getReserva: function (filter, number) {

                var me = this;

                console.log(filter, number);

                var oModel = this.getView().getModel("viewModel"); // set the alias here
                oModel.setProperty("/materiales", [])
                oModel.setProperty("/edited", false)

                this._clearCrudTable()


                var defaultModel = this.getOwnerComponent().getModel("appModel");

                var filters = [];


                if (filter == this.AUFNR) {
                    filters.push(new Filter({
                        path: "Aufnr",
                        operator: FilterOperator.EQ,
                        value1: number
                    }));

                } else if (filter = this.RSNUM) {

                    filters.push(new Filter({
                        path: "Rsnum",
                        operator: FilterOperator.EQ,
                        value1: number
                    }));

                }

                /*
                                filters.push(new Filter({
                                    path: "Rsnum",
                                    operator: FilterOperator.EQ,
                                    value1: '0000000136'
                                }));
                        
                                */

                //   this.getModel("viewModel").setProperty("/materiales", posiciones);

                var that = this;
                var sPath = "/reservas_listSet";
                defaultModel.setUseBatch(false);

                defaultModel.read(sPath, {
                    filters: filters,
                    method: "GET",
                    success: function (oData, oResponse) {
                        console.log("getting reservas")
                        //	oResponse.headers['x-csrf-token']);



                        if (oData && oData.results) {

                            var data = oData.results

                            oModel.setProperty("/materiales", data)
                            me._onQuickFilter()


                            if(data.length == 0){
                            that.onErrorMessageDialog("No se encontro orden o reserva")
                            }

                        }

                        console.log(defaultModel)
                        console.log(oData)


                    },
                    error: function (oError) {
                        console.log("on Error")
                        console.log(oError); //	oBusy.setProperty("/busy2", false);
                        //	var msg = "Error al obtener los materiales";
                        //	MessageToast.show(msg);

                    }
                }

                );

            },




            /**GET CATALOGS*/




            _getMateriales: function () {


                var oModel = this.getView().getModel("materialesModel"); // set the alias here



                var defaultModel = this.getOwnerComponent().getModel("appModel");

                var filters = [];

                filters.push(new Filter({
                    path: "Aufnr",
                    operator: FilterOperator.EQ,
                    value1: ''
                }));




                var that = this;
                var sPath = "/materiales_listSet";
                defaultModel.setUseBatch(false);
                defaultModel.setHeaders({ "Accept-Language": "es-419,es;q=0.9" });


                defaultModel.read(sPath, {
                    //filters: filters,
                    method: "GET",
                    success: function (oData, oResponse) {
                        console.log("getting reservas")
                        //	oResponse.headers['x-csrf-token']);



                        if (oData && oData.results) {

                            var data = oData.results
                            oModel.setSizeLimit(data.length)
                            oModel.setData(data)

                        }

                        console.log(defaultModel)
                        console.log(oData)


                    },
                    error: function (oError) {
                        console.log("on Error")
                        console.log(oError); //	oBusy.setProperty("/busy2", false);
                        //	var msg = "Error al obtener los materiales";
                        //	MessageToast.show(msg);

                    }
                }

                );

            },








            _getCentros: function (Matnr) {


                var oModel = this.getView().getModel("viewModel"); // set the alias here



                var defaultModel = this.getOwnerComponent().getModel("appModel");

                var filters = [];

                var filters = [];
                filters.push(new Filter({
                    path: "Matnr",
                    operator: FilterOperator.EQ,
                    value1: Matnr
                }));






                var that = this;
                var sPath = "/centros_listSet";
                defaultModel.setUseBatch(false);

                defaultModel.read(sPath, {
                    filters: filters,
                    method: "GET",
                    success: function (oData, oResponse) {
                        console.log("getting reservas")
                        //	oResponse.headers['x-csrf-token']);



                        if (oData && oData.results) {

                            var data = oData.results

                            oModel.setProperty("/catalogo_centros", data)

                        }

                        console.log(defaultModel)
                        console.log(oData)


                    },
                    error: function (oError) {
                        console.log("on Error")
                        console.log(oError); //	oBusy.setProperty("/busy2", false);
                        //	var msg = "Error al obtener los materiales";
                        //	MessageToast.show(msg);

                    }
                }

                );

            },




            _getAlmacenes: function (Werks) {


                var oModel = this.getView().getModel("viewModel"); // set the alias here
                    oModel.setSizeLimit("400");


                var defaultModel = this.getOwnerComponent().getModel("appModel");

                var filters = [];

                filters.push(new Filter({
                    path: "Werks",
                    operator: FilterOperator.EQ,
                    value1: Werks
                }));






                var that = this;
                var sPath = "/almacenes_listSet";
                defaultModel.setUseBatch(false);

                defaultModel.read(sPath, {
                    filters: filters,
                    method: "GET",
                    success: function (oData, oResponse) {
                        console.log("getting reservas")
                        //	oResponse.headers['x-csrf-token']);



                        if (oData && oData.results) {

                            var data = oData.results
                            oModel.setSizeLimit("400");
                            oModel.setProperty("/catalogo_almacenes", data)

                        }

                        console.log(defaultModel)
                        console.log(oData)


                    },
                    error: function (oError) {
                        console.log("on Error")
                        console.log(oError); //	oBusy.setProperty("/busy2", false);
                        //	var msg = "Error al obtener los materiales";
                        //	MessageToast.show(msg);

                    }
                }

                );

            },




            _getUM: function (Matnr) {


                ///sap/opu/odata/sap/ZPM_RESERVAS_SRV/um_listSet?$format=json&$filter=Matnr%20eq%20%27167%27


                var oModel = this.getView().getModel("viewModel"); // set the alias here
                var defaultModel = this.getOwnerComponent().getModel("appModel");

                var filters = [];
                filters.push(new Filter({
                    path: "Matnr",
                    operator: FilterOperator.EQ,
                    value1: Matnr
                }));




                var that = this;
                var sPath = "/um_listSet";
                defaultModel.setUseBatch(false);

                defaultModel.read(sPath, {
                    filters: filters,
                    method: "GET",
                    success: function (oData, oResponse) {
                        console.log("getting um")
                        //	oResponse.headers['x-csrf-token']);



                        if (oData && oData.results) {

                            var data = oData.results

                            oModel.setProperty("/catalogo_um", data)

                        }

                        console.log(defaultModel)
                        console.log(oData)


                    },
                    error: function (oError) {
                        console.log("on Error")
                        console.log(oError); //	oBusy.setProperty("/busy2", false);
                        //	var msg = "Error al obtener los materiales";
                        //	MessageToast.show(msg);

                    }
                }

                );

            },





            //obtener numeros de serie 

            _getSeriales: function (Matnr,Werks,Lgort) {


                ///sap/opu/odata/sap/ZPM_RESERVAS_SRV/um_listSet?$format=json&$filter=Matnr%20eq%20%27167%27


                var oModel = this.getView().getModel("viewModel"); // set the alias here
                var defaultModel = this.getOwnerComponent().getModel("appModel");

                var filters = [];
                filters.push(new Filter({
                    path: "Matnr",
                    operator: FilterOperator.EQ,
                    value1: Matnr
                }));
                filters.push(new Filter({
                    path: "Werks",
                    operator: FilterOperator.EQ,
                    value1: Werks
                }));
                filters.push(new Filter({
                    path: "Lgort",
                    operator: FilterOperator.EQ,
                    value1: Lgort 
                }));








                var that = this;
                var sPath = "/seriales_listSet";
                defaultModel.setUseBatch(false);

                defaultModel.read(sPath, {
                    filters: filters,
                    method: "GET",
                    success: function (oData, oResponse) {
                        console.log("getting seriales")
                        //	oResponse.headers['x-csrf-token']);



                        if (oData && oData.results) {

                            var data = oData.results

                            oModel.setProperty("/catalogo_seriales", data)

                        }

                        console.log(defaultModel)
                        console.log(oData)


                    },
                    error: function (oError) {
                        console.log("on Error")
                        console.log(oError); //	oBusy.setProperty("/busy2", false);
                        //	var msg = "Error al obtener los materiales";
                        //	MessageToast.show(msg);

                    }
                }

                );

            },








            /** CONFIRMATION DIALOGS */




            /*ALERT DIALOGS*/



            onErrorMessageDialog: function (error) {
                this.oErrorMessageDialog = null
                if (!this.oErrorMessageDialog) {
                    this.oErrorMessageDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Error",
                        state: ValueState.Error,
                        content: new Text({ text: error }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "OK",
                            press: function () {
                                this.oErrorMessageDialog.close();
                            }.bind(this)
                        })
                    });
                }

                this.oErrorMessageDialog.open();
            },

            // TABLA DE CONFIRMACION DE ESTATUS 


            onSuccessMessageDialog: function (msg) {
                this.oSuccessMessageDialog = null

                var content = []
                var success = false

                for (var item of msg) {
                    if(item.Type == 'E' ){
                    content.push(new ObjectStatus({
                        text:item.Row +' '+item.Message,
                        state:sap.ui.core.ValueState.Error,
                        icon:"sap-icon://error"

                    }) )


                  

                   }else if(item.Type == 'S'){
                    content.push(new ObjectStatus({
                        text:item.Row +' '+item.Message,
                        state:sap.ui.core.ValueState.Success,
                        icon:"sap-icon://sys-enter-2"
                    }))

                    success = true
                   }

                }


                var layout = new VerticalLayout({content:content})

                if (!this.oSuccessMessageDialog) {
                    this.oSuccessMessageDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Registro Materiales",
                        state: ValueState.Information,
                        content: [layout],
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "OK",
                            press: function () {

                                if(success){
                                this.onReset(null);
                                }
                                this.oSuccessMessageDialog.close();
                            }.bind(this)
                        })
                    });
                }

                this.oSuccessMessageDialog.open();
            },









        });
    });
