# dhis2-js-library
This is a javascript library to access dhis as Modals
The main problem it solves is the occurance of foreign keys within programs in dhis

Things to consider

1. All dataElements that refference other program dataElements should have a prefix and the spaces should be underscored

#How to use

1.Download the library <a href="">here</a>.

2.Include the script on your html page

    <script src="dhis2-library.js">
    
3.Configure

    var config = {
		  baseUrl:"/dhis/",
		  refferencePrefix:"Program_",
		  onLoad : function(){
			  //Start using the dhis objects here. All relevant dhis programming goes here
			});
		  }
    }
    
4. Initialize dhis

    dhis2.Init(config);
    
5. Hurray you are done. Have fun Programming.