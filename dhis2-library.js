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
		/**
		 *	Function to be envoked when initializing dhis2 data
		 *
		 *	@param config eg. config{ baseUrl,refferencePrefix,onLoad(function)}
		 *
		 */
		Init : function(config){
			dhis2.config = config;
			//Fetch dataElements from the dhis server
			get(dhis2.config.baseUrl + "api/dataElements?paging=false", function(results) {
				//Set the dhis data elements
				dhis2.data.dataElements = results.dataElements;
				//Fetch programs from the dhis server
				get(dhis2.config.baseUrl + "api/programs?paging=false", function(results2) {
					//Set the dhis programs
					dhis2.data.programs = results2.programs;
					//Load the scripts to use from user
					dhis2.config.onLoad();
				});
			});
		},
		//Holds specific dhis data and objects related to data
		data : {
			
		},
		
}
/**
 * 
 *	This is the modal that reflects a program in the database
 *	
 *	@param string modalName (Name of the Program in dhis2 to be mirrored)
 *
 *	@param array relations (Array of relationships of the program Should be in the form [{"name":"Program Name","type" : "ONE_MANY | MANY_MANY"}])
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
	 * @param string id
	 * 
	 * @return dataElement
	 */
	this.getDataElement = function(id) {
		for (i = 0; i < dhis2.data.dataElements.length; i++) {
			if (dhis2.data.dataElements[i].id == id) {
				return dhis2.data.dataElements[i];
			}
		}
	}
	/**
	 * Gets all rows of a program
	 * 
	 * @param function onResult (Callback after the result is returned)
	 * 
	 */
	this.getAll = function(onResult){
		//Get program by name
		var program = self.getProgramByName(self.modalName);
		// Stores the rows of an entity
		this.events = [];
		var selfGetAll = this;
		//Checks that all requests are made
		this.count = [];
		this.resultsFetched = function(){
			if (selfGetAll.count.length == 0) {
				onResult(selfGetAll.events);
			}
		}
		//Get events of the program from the server
		get(dhis2.config.baseUrl + "api/events?program="+program.id,function(result){
			for (j = 0; j < result.events.length; j++) {//For each event render to entity column json
				var event = result.events[j];
				selfGetAll.count.push(1);
				
				//Render events to appropriate Modal
				self.renderToJSON(event, function(object) {
					//Push object to events
					
					//document.getElementById("result").innerHTML += JSON.stringify(selfGet.events) +"<br /><br />";
					selfGetAll.events.push(object);
					
					//Pop count to signify
					selfGetAll.count.pop();
					
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
	 * @param object where (Search criteria)
	 * 
	 * @param function onResult (Callback after the result is returned)
	 * 
	 */
	this.get = function(where,onResult){
		//Get program by name
		var program = self.getProgramByName(self.modalName);
		// Stores the rows of an entity
		this.events = [];
		var selfGet = this;
		//Checks that all requests are made
		this.count = [];
		this.resultsFetched = function(){
			if (selfGet.count.length == 0) {
				onResult(selfGet.events);
			}
		}
		//Get events of the program from the server
		get(dhis2.config.baseUrl + "api/events?program="+program.id,function(result2){
			for (j = 0; j < result2.events.length; j++) {//For each event render to entity column json
				var event = result2.events[j];
				for (k = 0; k < event.dataValues.length; k++) {
					if(event.dataValues[k].value == where.value){//Checks the conditions provided
						selfGet.count.push(1);
						//Render events to appropriate Modal
						self.renderToJSON(event, function(object) {
							//Push object to events
							selfGet.events.push(object);
							//Pop count to signify
							selfGet.count.pop();
							//Check if all results from the server are fetched
							selfGet.resultsFetched();
						});
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
	 * @param string id
	 * 
	 * @param function onResult (Callback after the result is returned)
	 * 
	 */
	this.find = function(uid, onResult) {
		//Get program by name
		var program = self.getProgramByName(modalName);
		//Get events of the program from the server
		get(dhis2.config.baseUrl + "api/events?paging=false&program=" + program.id + "",
				function(result) {
			for (i = 0; i < result.events.length; i++) {//For each event
				if (result.events[i].event == uid) {//Checks the id
					
					//Render to entity column json
					self.renderToJSON(result.events[i], function(
							object) {
						onResult(object);
					});
					return;
				}
			}
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
		 * @param dhis2.data.Modal programModal
		 * 
		 * @param string id
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
					selfrenderToJSON.object[selfProgram.program.getModalName()] = result;
					
					//Check if all results from the server are fetched
					selfrenderToJSON.checkAllResultsFetched();
				});
			}
			//Push the RefferenceProgram to hel the fetch
			selfrenderToJSON.count.push(refProgram);
		}
		selfrenderToJSON.checkAllResultsFetched();
	}
};
/**
 * Asynchronous request to get
 */
function get(url, callback) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			callback(JSON.parse(xmlhttp.responseText));
		}
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.send(null);
}
