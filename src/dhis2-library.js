/**
 * 
 * 	@author Vincent P. Minde
 * 
 *	This is Library to ease the use of dhis2
 * 	 
 */

/**
 * JavaScript helper for String type
 */
if (typeof String.prototype.startsWith != 'function') {
	/**
	 * Checks if a string starts with a given string
	 * 
	 * @param string
	 * 
	 * @return boolean
	 * 
	 */
	  String.prototype.startsWith = function (str){
	    return this.indexOf(str) === 0;
	  };
}
if (typeof String.prototype.endsWith != 'function') {
	/**
	 * Checks if a string ends with a given string
	 * 
	 * @param string
	 * 
	 * @return boolean
	 * 
	 */
	  String.prototype.endsWith = function (str){
	    return this.slice(-str.length) == str;
	};
}
/**
 * 
 * This is the dhis2 main object
 * 
 */
dhis2 = {
		//Holds specific dhis data and objects related to data
		data : {
			
		},
		
}
/**
 *	Function to be envoked when initializing dhis2 data
 *	@constructor
 *	@param config {array} eg. config{ baseUrl,refferencePrefix,onLoad(function)}
 *
 */
dhis2.Init = function(config){
	dhis2.config = config;
	//Fetch dataElements from the dhis server
	http.get(dhis2.config.baseUrl + "api/dataElements?paging=false", function(results) {
		//Set the dhis data elements
		dhis2.data.dataElements = results.dataElements;
		//Fetch programs from the dhis server
		http.get(dhis2.config.baseUrl + "api/programs?paging=false", function(results2) {
			//Set the dhis programs
			dhis2.data.programs = results2.programs;
			//Load the scripts to use from user
			dhis2.config.onLoad();
		});
	});
}
/**
 * 
 *	This is the modal that reflects a program in the database
 *	@constructor
 *	@param modalName {string} Name of the Program in dhis2 to be mirrored
 *
 *	@param relations {array}  Array of relationships of the program. Should be in the form [{"name":"Program Name","type" : "ONE_MANY | MANY_MANY"}]
 *
 */
dhis2.data.Modal = function (modalName,relations) {
	//Set self to get refference of this object
	self = this;
	//Set the modal name
	this.modalName = modalName;
	//Set relations
	this.relations = relations;
	/**
	 * Get the Modal name
	 * 
	 * @return string modal name
	 */
	this.getModalName = function(){
		return modalName;
	}
	/**
	 * Get a program from the list of dhis2 programs by its name
	 * 
	 * @param string name
	 * 
	 * @return Program
	 */
	this.getProgramByName = function(name){
		name = name.replace("_"," ");
		for(i = 0;i < dhis2.data.programs.length;i++){
			if(dhis2.data.programs[i].name == name){
				return dhis2.data.programs[i];
			}
		}
	}
	/**
	 * Get a data element from the list of dhis2 dataElements by its id
	 * 
	 * @param id {string} This is the dataElement id
	 * 
	 * @return {object} The data element as a jsonObject
	 */
	this.getDataElement = function(id) {
		for (i = 0; i < dhis2.data.dataElements.length; i++) {
			if (dhis2.data.dataElements[i].id == id) {
				return dhis2.data.dataElements[i];
			}
		}
	}
	/**
	 * Get a data element from the list of dhis2 dataElements by its name
	 * 
	 * @param dataElementName {string} This is the name of the data element
	 * 
	 * @return {object} The data element as a jsonObject
	 */
	this.getDataElementByName = function(name) {
		for (i = 0; i < dhis2.data.dataElements.length; i++) {
			if (dhis2.data.dataElements[i].name == name) {
				return dhis2.data.dataElements[i];
			}
		}
	}
	/**
	 * Gets all rows of a program
	 * 
	 * @param onResult {function}  Callback function after the result is returned
	 * 
	 */
	this.getAll = function(onResult){
		//Get program by name
		var program = self.getProgramByName(self.modalName);
		// Stores the rows of an entity
		this.events = [];
		var selfGetAll = this;
		//Checks that all requests are made
		this.resCount = [];
		this.resultsFetched = function(){
			if (selfGetAll.resCount.length == 0) {
				onResult(selfGetAll.events);
			}
		}
		//Get events of the program from the server
		http.get(dhis2.config.baseUrl + "api/events?program="+program.id,function(result){
			for (j = 0; j < result.events.length; j++) {//For each event render to entity column json
				var event = result.events[j];
				selfGetAll.resCount.push(1);
				
				//Render events to appropriate Modal
				self.renderToJSON(event, function(object) {
					//Push object to events
					
					//document.getElementById("result").innerHTML += JSON.stringify(selfGet.events) +"<br /><br />";
					selfGetAll.events.push(object);
					
					//Pop count to signify
					selfGetAll.resCount.pop();
					
					//Check if all results from the server are fetched
					selfGetAll.resultsFetched();
				});
			}
			//Check if all results from the server are fetched
			selfGetAll.resultsFetched();
		});
		return;
	}
	/**
	 * Search events of a program
	 * 
	 * @param where {array} Array of search criterias where each element in the array is an object in the form {name,operator,value}
	 * 
	 * @param onResult {function} Callback after the result is returned
	 * 
	 */
	this.get = function(where,onResult){
		//Get program by name
		var program = self.getProgramByName(self.modalName);
		// Stores the rows of an entity
		this.events = [];
		var selfGet = this;
		//Checks that all requests are made
		this.getCount = [];
		this.resultsFetched = function(){
			if (selfGet.getCount.length == 0) {
				onResult(selfGet.events);
			}
		}
		//Get events of the program from the server
		http.get(dhis2.config.baseUrl + "api/events?program="+program.id,function(result2){
			for (j = 0; j < result2.events.length; j++) {//For each event render to entity column json
				var event = result2.events[j];
				for (k = 0; k < event.dataValues.length; k++) {
					if(event.dataValues[k].value == where.value){//Checks the conditions provided
						
						selfGet.getCount.push(1);
						//Render events to appropriate Modal
						self.renderToJSON(event, function(object) {
							//Push object to events
							selfGet.events.push(object);
							//Pop count to signify
							selfGet.getCount.pop();
							//Check if all results from the server are fetched
							selfGet.resultsFetched();
						});
						break;
					}
					
				}
			}
			//Check if all results from the server are fetched
			selfGet.resultsFetched();
		});
		return;
	}
	/**
	 * Find events of a program by id
	 * 
	 * @param id {string} Identifier of an event
	 * 
	 * @param onResult {function} Callback function after the result is returned.
	 * 
	 */
	this.find = function(uid, onResult) {
		//Get program by name
		var program = self.getProgramByName(modalName);
		//Get events of the program from the server
		http.get(dhis2.config.baseUrl + "api/events/" + uid + ".json",
				function(result) {
			//Render to entity column json
			self.renderToJSON(result, function(object) {
				onResult(object);
			});
		});
	}

	this.renderToJSON = function(event, onSuccess) {
		//Object that holds the row data
		this.object = {};
		this.count = [];
		var selfrenderToJSON = this;
		//Checks that all requests are made
		this.count = [];
		this.checkAllResultsFetched = function(){
			if(selfrenderToJSON.count.length > 0)
			{
				selfrenderToJSON.count.pop().fetch();
			}else{
				onSuccess(selfrenderToJSON.object);
			}
			
		}
		/**
		 * Helper to fetch refference program
		 * 
		 * @constructor
		 * 
		 * @param programModal {dhis2.data.Modal} Program to fetch from
		 * 
		 * @param id {string} Identifier of the event to be fetched from the program
		 */
		var RefferenceProgram = function(programModal, id) {
			this.program = programModal;
			this.value = id;
			this.fetch = function() {
				
				var selfProgram = this;
					//Find the event from the modal being refferenced
					this.program.find(this.value, function(result) {
						//Set the field in the json
						selfrenderToJSON.object[selfProgram.program.getModalName()] = result;
						
						//Check if all results from the server are fetched
						selfrenderToJSON.checkAllResultsFetched();
					});
			}
		}
		this.object["id"] = event.event;
		
		for (k = 0; k < event.dataValues.length; k++) {
			
			var dataValue = event.dataValues[k];
			var dataElement = self.getDataElement(dataValue.dataElement);
			if (!dataElement.name.startsWith(dhis2.config.refferencePrefix)) {//If dataElement is not a foregin key
				//Set the value in the object
				selfrenderToJSON.object[dataElement.name] = dataValue.value;
			} else {//If dataElement is a foregin key fetch the refferencing program
				
				//Remove the refferencePrefix prefix to get the program for reffencing
				var program = dataElement.name.substring(dhis2.config.refferencePrefix.length);
				//Initialize the Modal from the program name
				var programModal = new dhis2.data.Modal(program, []);
				//Push the RefferenceProgram to hel the fetch
				selfrenderToJSON.count.push(new RefferenceProgram(programModal,dataValue.value));
			}
		}
		//Add relations to the object as specified by the relations
		//
		
		for (k = 0; k < relations.length; k++) {//For each relation
			
			var relation = relations[k];
			var programModal = null;
			if(relation.type == "ONE_MANY"){//If relationship is one to many
				programModal = new dhis2.data.Modal(relation.name, []);
			}else if(relation.type == "MANY_MANY"){//If relationship is many to many
				//Create modal with one to many relation with the pivot entity
				programModal = new dhis2.data.Modal(relation.pivot, [{
					"name" : relation.name,
					"type" : "ONE_MANY"
				}]);
			}
			//Initialize the RefferenceProgram from the program name
			var refProgram = new RefferenceProgram(programModal,dataValue.value);
			//Override the fetch function to implement a get instead of a find
			refProgram.fetch = function() {
				var selfProgram = this;
				this.program.get({program:self.getModalName(),value:selfrenderToJSON.object.id}, function(result) {	
					selfrenderToJSON.object[selfProgram.program.getModalName() + "s"] = result;
					
					//Check if all results from the server are fetched
					selfrenderToJSON.checkAllResultsFetched();
				});
			}
			//Push the RefferenceProgram to hel the fetch
			selfrenderToJSON.count.push(refProgram);
		}
		selfrenderToJSON.checkAllResultsFetched();
	}
	/**
	 * Converts a json object to an event representation in dhis
	 * 
	 * @param object {object} Json object to convert
	 * 
	 * @param otherData {object} Additional data to be added to the event like program,eventDate,orgUnit etc
	 */
	this.convertToEvent = function(object,otherData){
		program = self.getProgramByName(self.modalName);
		var selfConvertToEvent = this;
		var date = new Date();
		var event = {
				program:program.id,
				dataValues:[]
		};
		for(var key in otherData){
			event[key] = otherData[key];
		}
		for(var key in object){
			var element ={};
			if(typeof object[key] == "object"){
            	var dataElement = self.getDataElementByName(dhis2.config.refferencePrefix + key.replace(" ","_"));
            	if(dataElement != undefined)
            	{
            		element.dataElement = dataElement.id;
                	element.value = object[key].id;
            	}else{
            		dataElement = self.getDataElementByName(key);
            		if(dataElement != undefined)
                	{
            			element.dataElement = dataElement.id;
            			element.value = object[key];
                	}
            	}
            }else if(key.indexOf("_") > -1){
            	var dataElement = self.getDataElementByName(dhis2.config.refferencePrefix + key.replace(" ","_"));
            	element.dataElement = dataElement.id;
    			element.value = object[key];
            }
            else{
            	var dataElement = self.getDataElementByName(key);
            	element.dataElement = dataElement.id;
            	element.value = object[key];
            }
            event.dataValues.push(element);
        }
		return event;
	}
	/**
	 * Save an event from a json object
	 * 
	 * @param data {object | array} Json object to be saved
	 * 
	 * @param onSuccess {function} Callback function after the result is returned successfully.
	 * 
	 * @param (Optional) onError {function} Callback function an error has occured.
	 */
	this.save = function(data,otherData,onSuccess,onError){
		var sendData = {};
		if(Array.isArray(data)){
			var events = [];
			
			for(count = 0; count < data.length;count++){
				events.push(self.convertToEvent(data[count],otherData));
			}
			sendData.events = events;
		}else{
			sendData = self.convertToEvent(data,otherData);
		}
		//var event = self.convertToEvent(data);
		console.log("Saving Data:" + JSON.stringify(sendData));
		http.post(dhis2.config.baseUrl + "api/events",JSON.stringify(sendData),function(results){
			onSuccess(results);
		},function(results){
			onError(results);
		});
	}
};
/**
 * 
 *	Makes http requests
 *
 *	@constructor
 *	
 */
http = {
	/**
	 * Makes a http request
	 * 
	 * @param url {string} Url for the request
	 * 
	 * @param method {string} Method to be used.
	 * 
	 * @param data {object} Data to be sent to the server.
	 * 
	 * @param onSuccess {function} Callback function after the result is returned successfully.
	 * 
	 * @param (Optional) onError {function} Callback function an error has occured.
	 */
	request : function(url,method,data,onSuccess,onError){
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				try{
					onSuccess(JSON.parse(xmlhttp.responseText));
				}catch(e){
					if(onError == undefined){
						console.error(e);
					}else
					{
						onError(e);
					}
				}
				
			}
		}
		xmlhttp.open(method, url, true);
		xmlhttp.setRequestHeader("Content-Type", "application/json");
		xmlhttp.send(data);
	},
	/**
	 * Makes a http get request
	 * 
	 * @param url {string} Url for the request
	 * 
	 * @param onSuccess {function} Callback function after the result is returned successfully.
	 * 
	 * @param (Optional) onError {function} Callback function an error has occured.
	 */
	get : function(url, onSuccess,onError) {
		this.request(url,"GET",null,onSuccess,onError);
	},
	/**
	 * Makes a http post request
	 * 
	 * @param url {string} Url for the request
	 * 
	 * @param onSuccess {function} Callback function after the result is returned successfully.
	 * 
	 * @param (Optional)onError {function} Callback function an error has occured.
	 */
	post : function(url, data,onSuccess,onError) {
		this.request(url,"POST",data,onSuccess,onError);
	}
}
