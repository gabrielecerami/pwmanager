/**
 * @author Gabriele Cerami
 */


(function($) {
    $.fn.toggleMask = function() {
        	var decryptpass = "**ERROR**";
           	var accountid=$(this).attr('accountid');
            if ($(this).hasClass('masked')) {
            	$.ajax({
					url: 'https://' + connectionURI + '/api/v1/account/'+ accountid +'/decryptpass/?masterpass='+masterpassword+'&format=json',
					dataType: 'json',
					async: false,
					success: function(json){
            				decryptpass=json.password;
            		}
				});

				$(this).text(decryptpass);
				$(this).removeClass('masked');
            }
            else {
                $(this).text('Show');
                $(this).addClass('masked');
             }
    return this;
	};
})(jQuery);

Date.prototype.setISO8601 = function (string) {
	var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
	"(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
	"(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3]); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]-2); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    this.setTime(Number(time));
}


	function addaccounttolist (accountdata,position){
		global_table_data[accountdata.id] = accountdata;
		/* TODO addaccount to list only if matches hte search criteria*/
		var accountnumber=accountdata.id;
		var ctdate = new Date
		ctdate.setISO8601(accountdata.creation_time)
		var mtdate = new Date
		mtdate.setISO8601(accountdata.modify_time)
		var etdate = new Date
		/*if (etdate != null ) {
			etdate.setISO8601(accountdata.expiry_time)
		}*/
		if (position==0) { // no position specified
			global_shown_account_list.push(accountdata.id)
			html= '\
				<tr id="account'+ accountnumber +'" accountid="' + accountnumber + '"> \
				<td>'+accountnumber+'</td>\
				<td><div accountid="'+ accountnumber +'" class="delaccount"><center>del</center></div><div accountid="'+ accountnumber +'" class="modifyaccount"><center>mod</center></div></td>\
				<td>' + accountdata.group + '</td>\
				<td>' + accountdata.title + '</td>\
				<td>' + accountdata.username + '</td>\
				<td>' + accountdata.url + '</td>\
				<td> <div id="account'+ accountnumber+'pass" accountid="'+ accountnumber +'" class="mask masked">Show</div></td>\
				<td>'+ accountdata.note + '</td>\
				<td>'+ ctdate.getDate()+'/'+ ctdate.getMonth()+'/'+ ctdate.getFullYear() +' '+ ctdate.getHours()+':'+ctdate.getMinutes() + '</td>\
				<td>'+ mtdate.getDate()+'/'+ mtdate.getMonth()+'/'+ mtdate.getFullYear() +' '+ mtdate.getHours()+':'+mtdate.getMinutes() + '</td>\
				<td>' + accountdata.expiry_time + '</td>\
				<td>'+ accountdata.tag_list + '</td>\
				</tr>\
			';
			$("#accountlist").append(html);
		}
		else {
		
			html= '\
				<td>'+accountnumber+'</td>\
				<td><div accountid="'+ accountnumber +'" class="delaccount"><center>del</center></div><div accountid="'+ accountnumber +'" class="modifyaccount"><center>mod</center></div></td>\
				<td>' + accountdata.group + '</td>\
				<td>' + accountdata.title + '</td>\
				<td>' + accountdata.username + '</td>\
				<td>' + accountdata.url + '</td>\
				<td> <div id="account'+ accountnumber+'pass" accountid="'+ accountnumber +'" class="mask masked">Show</div></td>\
				<td>'+ accountdata.note + '</td>\
				<td>'+ ctdate.getDate()+'/'+ ctdate.getMonth()+'/'+ ctdate.getFullYear() +' '+ ctdate.getHours()+':'+ctdate.getMinutes() + '</td>\
				<td>'+ mtdate.getDate()+'/'+ mtdate.getMonth()+'/'+ mtdate.getFullYear() +' '+ mtdate.getHours()+':'+mtdate.getMinutes() + '</td>\
				<td>' + accountdata.expiry_time + '</td>\
				<td>'+ accountdata.tag_list + '</td>\
			';
			alert(html)
			$("#account"+accountid).html(html)
		}		
									
	}


		function finaliseaccountlist() {
					$('.mask').unbind('dblclick')
					$('.mask').dblclick(function() {
						$(this).toggleMask();
						return false;
					});
					$('.delaccount').unbind('click');
					$('.delaccount').button().click(function() {
						accountid=$(this).attr('accountid');
						html='\
							<div id="delaccountdialog" title="Delete Account '+ accountid +'"> \
								<span id="delaccountdialog-message">Are you sure you want to delete this account ?</span>\
							</div> \
						';

						$( "#dynamic-content" ).append(html)

						$( "#delaccountdialog" ).dialog({
							height: 500,
							width: 350,
							modal: true,
							buttons: {
								"yes": function() {

									c_time = global_table_data[accountid].creation_time
									c_time = c_time.replace("T","%20");
									$.ajax({
										url: 'https://' + connectionURI + '/api/v1/account/' + accountid + '/?creation_time=' + c_time,
										type: 'DELETE',
										contentType: 'application/json',
										dataType: 'json',
										processData: false,
										success:  function(data, textStatus, jqXHR) {
											$("#account"+accountid).remove()
											$("#delaccountdialog-message").text("Account deleted");
											$('#delaccountdialog').dialog({ 
												buttons:{
													"OK": function() {
														$(this).dialog("close");
													}
												} 
											});
										},
										error:  function(data, textStatus, jqXHR) {
											$("#delaccountdialog-message").text("Error Deleting account");
											$('#delaccountdialog').dialog({ 
												buttons:{
													"OK": function() {
														$('#delaccountdialog').dialog("close");
													}
												} 
											})
										},
									});
								},
								"NO": function(){
									$(this).dialog("close")
								}
							},
							close: function() {
								$("#delaccountdialog").remove()
							/*allFields.val( "" ).removeClass( "ui-state-error" );*/	
							}
						});
					
					});
					
					$('.modifyaccount').unbind('click');
					$('.modifyaccount').button().click(function() {
						accountid=$(this).attr('accountid');
	
				$("#modifyaccountdialog-message").text("")
				$("#modifyaccountdialog-message").removeClass("ui-state-error")
				$("#modifyaccountdialog-message").removeClass("ui-state-highlight")
				$("#modifyaccountdialog").show()

				var group = $( "#modifyaccount-group" ),
					title = $( "#modifyaccount-title" ),
					password = $( "#modifyaccount-password" ),
					url = $("#modifyaccount-url"),
					username = $("#modifyaccount-username"),
					note = $("#modifyaccount-note"),
					tag = $("#modifyaccount-tag"),
					allFields = $( [] ).add( group ).add( title ).add( password ).add( url ).add( username ).add( note ).add( tag ),
					decryptpass = "**ERROR***";

					$.getJSON('https://' + connectionURI + '/api/v1/account/'+ accountid+'/?format=json', function(accountdata){
			            	$.ajax({
								url: 'https://' + connectionURI + '/api/v1/account/'+ accountid +'/decryptpass/?masterpass='+masterpassword+'&format=json',
								dataType: 'json',
								async: false,
								success: function(json){
           		 					decryptpass=json.password;
            					}
            				});

							group.val(accountdata.group), 
							title.val(accountdata.title), 
							username.val(accountdata.username), 
							password.val(decryptpass),
							url.val(accountdata.url),
							note.val(accountdata.note),
							tag.val(accountdata.tag_list)
					});
				
				$( "#modifyaccountdialog" ).dialog({
				height: 550,
				width: 450,
				modal: true,
				buttons: {
					"Modify": function() {
						var data = JSON.stringify({
							"database": "/api/v1/database/"+ databaseID +"/",
							"masterpassword": masterpassword,
							"group": group.val(), 
							"title": title.val(), 
							"username": username.val(), 
							"password" : password.val(),
							"url": url.val(),
							"note": note.val(),
							"tag_list": tag.val()
						});
						c_time = global_table_data[accountid].creation_time
						c_time = c_time.replace("T","%20");
						$.ajax({
							url: 'https://' + connectionURI + '/api/v1/account/' + accountid + '/?creation_time=' + c_time,
							type: 'PUT',
							contentType: 'application/json',
							data: data,
							dataType: 'json',
							processData: false,
							success:  function(data, textStatus, jqXHR) {
								$.getJSON('https://' + connectionURI + '/api/v1/account/'+ accountid+'/?format=json', function (data) {addaccounttolist(data,accountid)});
								console.log("got here");
								$("#modifyaccountdialog-message").text("Account Modified");
								$("#modifyaccountdialog-message").addClass("ui-state-highlight");
								$('#modifyaccountdialog').dialog({ 
									buttons:{
										"OK": function() {
											$('#modifyaccountdialog').dialog("close");
										}
									} 
								})
							},
							error:  function(data, textStatus, jqXHR) {
								$("#modifyaccountdialog-message").text("Unable to Modify "+jqXHR.getAllResponseHeader());
								$("#modifyaccountdialog-message").addClass("ui-state-error");
							}

						})
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
				},
				close: function() {
					finaliseaccountlist();
					("#modifyaccountdialog").hide();
				}
			});
		});
		
	}

		function createtable(tabledata){
			global_table_data = []
			if (tabledata.meta.total_count > 0) {
				document.getElementById('accountlist').innerHTML = '';
				/*("#accountlist").innerHTML("")*/
				global_shown_account_list = []
				for (index=0;index<tabledata.meta.total_count;index++){
					addaccounttolist(tabledata.objects[index],0);
				}
				finaliseaccountlist();

			}
			$("#accounttable").trigger("update");
			setTimeout(tablepage, 10);
			//tablepage();

		}

		function tablepage(){
			
			$("#accounttable").tablesorter({sortList: [[2,0]]});
			$("#accounttable").tablesorterPager({container: $("#pager")});
		}
		

		function parseCSVLine (line) {
				line = line.split(',');
				
				// check for splits performed inside quoted strings and correct if needed
				for (var i = 0; i < line.length; i++) {
					var chunk = line[i].replace(/^[\s]*|[\s]*$/g, "");
					var quote = "";
					if (chunk.charAt(0) == '"' || chunk.charAt(0) == "'") quote = chunk.charAt(0);
					if (quote != "" && chunk.charAt(chunk.length - 1) == quote) quote = "";
					
					if (quote != "") {
						var j = i + 1;
						
						if (j < line.length) chunk = line[j].replace(/^[\s]*|[\s]*$/g, "");
						
						while (j < line.length && chunk.charAt(chunk.length - 1) != quote) {
							line[i] += ',' + line[j];
							line.splice(j, 1);
							chunk = line[j].replace(/[\s]*$/g, "");
						}
						
						if (j < line.length) {
							line[i] += ',' + line[j];
							line.splice(j, 1);
						}
					}
				}
				
				for (var i = 0; i < line.length; i++) {
					// remove leading/trailing whitespace
					line[i] = line[i].replace(/^[\s]*|[\s]*$/g, "");
					
					// remove leading/trailing quotes
					if (line[i].charAt(0) == '"') line[i] = line[i].replace(/^"|"$/g, "");
					else if (line[i].charAt(0) == "'") line[i] = line[i].replace(/^'|'$/g, "");
				}
				return line;
			}
			
			function csvToJson (csvText) {
				var message = "";
				var error = false;
				var jsonText = "";
				csvRows = csvText.split(/[\r\n]/g); // split into rows
				// get rid of empty rows
				for (var i = 0; i < csvRows.length; i++) {
					if (csvRows[i].replace(/^[\s]*|[\s]*$/g, '') == "") {
						csvRows.splice(i, 1);
						i--;
					}
				}
				objArr = [];
				for (var i = 0; i < csvRows.length; i++) {
						csvRows[i] = parseCSVLine(csvRows[i]);
				}
				for (var i = 1; i < csvRows.length; i++) {
					if (csvRows[i].length > 0) objArr.push({});
					objArr[i - 1]["username"] = ""
					objArr[i - 1]["group"] = provided_group
					objArr[i - 1]["password"] = ""
					objArr[i - 1]["title"] = ""
					objArr[i - 1]["url"] = ""
					objArr[i - 1]["note"] = ""
					objArr[i - 1]["tag_list"] = ""

					for (var j = 0; j < csvRows[i].length; j++) {
						objArr[i - 1][csvRows[0][j]] = csvRows[i][j];
					}
					objArr[i - 1]["database"] = "/api/v1/database/"+databaseID+"/"
					objArr[i - 1]["masterpassword"] = masterpassword
				}
				jsonText = JSON.stringify(objArr, null, "\t");
				return jsonText
			}
					
		function reloadaccountdb (){
			$("#accountlist").remove()
			$("#accounttable").append('<tbody id="accountlist"></tbody>"')
			$.getJSON('https://' + connectionURI + '/api/v1/account/?format=json&limit=0',createtable);
                        /*$.ajax({
                        	url: 'https://' + connectionURI + '/api/v1/account/?limit=0&format=json',
                                type: 'GET',
                                dataType: 'json',
                                processData: false,
				async: false,
                                success:  createtable,
                        });*/

		}
		
		function search (){
			searchview = accountdb-json;
			createtable(searchview);
		}
		

		function handleFileSelect(evt) {
			var files = evt.target.files; // FileList object
// files is a FileList of File objects. List some properties.
			for (var i = 0, f; f = files[i]; i++) {
				var reader = new FileReader();
				reader.readAsText(f);

				reader.onload = function (event) {
					if (event.target.result == "") { alert("no text") }
					accountlist_import_file=event.target.result;
				}
			}
		}


		function documentready () {
			apiversion='/api/v1/'
			connectionURI=''
			masterpassword=''
			global_table_data = new Array
			provided_group = ""
	
			global_shown_account_list = new Array
			$("#accounttable").tablesorter({
				widgets: ['zebra'], 
				headers: { 
					1:{sorter:false},
					5:{sorter: false}, 
					6:{sorter: false}, 
					7:{sorter:false}
				}
//				,sortList: [[2,0], [3,0]]
			});
			

//			$("#accounttable").tablesorter({sortList: [[2,0]]});

			$("#addaccountdialog").hide()
			$( "#addaccount" )
			.button()
			.click(function() {
				
				$( "#addaccountdialog" ).show()
                                $('#addaccountdialog-form').each (function(){
                                   this.reset();
                                });
 	
				$( "#addaccountdialog" ).dialog({
				height: 500,
				width: 450,
				modal: true,
				buttons: {
					"Add": function() {
						var group = $( "#addaccount-group" ),
							title = $( "#addaccount-title" ),
							password = $( "#addaccount-password" ),
							url = $("#addaccount-url"),
							username = $("#addaccount-username"),
							note = $("#addaccount-note"),
							tag = $("#addaccount-tag"),
							allFields = $( [] ).add( group ).add( title ).add( password ).add( url ).add( username ).add( note ).add( tag );
							
						var data = JSON.stringify({
							"database": "/api/v1/database/"+databaseID+ "/",
							"masterpassword": masterpassword,
							"group": group.val(), 
							"title": title.val(), 
							"username": username.val(), 
							"password" : password.val(),
							"url": url.val(),
							"note": note.val(),
							"tag_list": tag.val()
						});

						$.ajax({
							url: 'https://' + connectionURI + '/api/v1/account/',
							type: 'POST',
							contentType: 'application/json',
							data: data,
							dataType: 'json',
							processData: false,
							success:  function(data, textStatus, jqXHR) {
								accountnumber=jqXHR.getResponseHeader('Location').slice(-2,-1)
								$.getJSON(jqXHR.getResponseHeader('Location')+'?format=json', function(data) {addaccounttolist(data,0)});
								$("#addaccountdialog-message").text("Account created as URI "+jqXHR.getResponseHeader('Location'));
								$("#addaccountdialog-message").addClass("ui-state-highlight");
								$('#addaccountdialog-form').each (function(){
								  this.reset();
								});
							},
							error:  function(data, textStatus, jqXHR) {
								$("#addaccountdialog-message").text("Account created as URI "+jqXHR.getAllResponseHeader());
								$("#addaccountdialog-message").addClass("ui-state-error");
							}

						})
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
				},
				close: function() {
					finaliseaccountlist();
					("#addaccountdialog").hide();
			/*allFields.val( "" ).removeClass( "ui-state-error" );*/	
			}
		});

});
			
						

			$( "#exportlist" )
			.button()
			.click(function() {

				html=' \
					<div id="exportlistdialog" title="Export actual list to kdbx file">\
						<input type="file" name="fileselect">\
					</div>\
				';

				$( "#dynamic-content" ).append(html)
				
				$( "#exportlistdialog" ).dialog({
					height: 500,
					width: 350,
					modal: true,
					buttons: {
						"Export": function() {
							$.ajax({
								url: 'https://' + connectionURI + '/api/v1/account/export/'+global_shown_account_list.join(";")+'/?masterpass='+masterpassword,
								type: 'GET',
								contentType: 'application/json',
								dataType: 'json',
								processData: false,
								success:  function(data, textStatus, jqXHR) {
									if (data.result==true) {
										$.getJSON('https://' + connectionURI + '/api/v1/account/?format=json&limit=0',createtable);
										$("#changedbdialog").dialog( "close" );
									}
									else{
										$("#changedbdialog-message").text("Wrong Master Password");
										$("#changedbdialog-message").addClass("ui-state-error");
									}
								}
							});

							
						},
						"cancel": function (){
							$("this").dialog("close")
						}
					},
					close: function() {
						("#exportlistdialog").remove()
					}
				
				});
			});

			$( "#reloaddb" )
			.button()
			.click(reloadaccountdb);

			$( "#dellistdialog" ).hide()


			$("#deletelist")
			.button()
			.click(function(){

				$( "#dellistdialog" ).show()
				$("#dellistdialog-message").text('Are you sure you want to delete accounts '+ global_shown_account_list.join())
				$( "#dellistdialog" ).dialog({
					height: 500,
					width: 350,
					modal: true,
					buttons: {
						"yes": function() {
							var errordel_accounts = new Array
							errordel_accounts = []
							for (i=0;i<global_shown_account_list.length;i++) { 
								accountid =  global_shown_account_list[i]

								c_time = global_table_data[accountid].creation_time
								c_time = c_time.replace("T","%20");
								$.ajax({
									url: 'https://' + connectionURI + '/api/v1/account/' + accountid + '/?creation_time=' + c_time,
									type: 'DELETE',
									async: false,
									contentType: 'application/json',
									dataType: 'json',
									processData: false,
									success:  function(data, textStatus, jqXHR) {
										$("#account"+accountid).remove()
									},
									error:  function(data, textStatus, errorThrown) {
										alert(errorThrown)
										errordel_accounts.push(accountid)
										alert(errordel_accounts.join())
									},
								});
							}
							
							if (errordel_accounts.length>0) 
								resulttext= "Error deleting accounts " + errordel_accounts.join()
							else {
								resulttext="All accounts deleted successfully"
								reloadaccountdb();
							}
								$("#dellistdialog-message").text(resulttext);
								$('#dellistdialog').dialog({ 
									buttons:{
										"OK": function() {
											$('#dellistdialog').dialog("close");
										}
									} 
								})
						},
						"NO": function(){
							$(this).dialog("close")
						}
					},
					close: function() {
						$("#dellistdialog").hide()
					/*allFields.val( "" ).removeClass( "ui-state-error" );*/	
					}
				});
			})
					
			$( "#changedbdialog" ).hide()

			
			$( "#changedb" )
			.button()
			.click(function() {
				$("#changedb-host").val(location.host)	
				/*Get database list*/
				/*https://localhost:8000/api/v1/database/?format=json*/
				
				//$( "#changedbdialog" ).show()

				$( "#changedbdialog" ).dialog({
					height: 500,
					width: 350,
					modal: true,
					buttons: {
						"Access": function() {
							host = $( "#changedb-host" ),
							id = $( "#changedb-id" ),
							masterpass = $( "#changedb-masterpass" )

							$.ajax({
								url: 'https://'+host.val()+'/api/v1/database/'+id.val()+'/checkpass/?masterpass='+masterpass.val(),
								type: 'GET',
								contentType: 'application/json',
								dataType: 'json',
								async: false,
								processData: false,
								success:  function(data, textStatus, jqXHR) {
									if (data.result==true) {
										setTimeout(function(){$("#dlgopen").dialog( "close" );}, 100);
										masterpassword=masterpass.val();
										connectionURI = host.val()
										databaseID = id.val()
										$.ajax({
											url:'https://' + connectionURI + '/api/v1/account/?format=json&limit=0',
											success:createtable,
											async:false,
											type:'GET',
											contentType: 'application/json',
											dataType: 'json'
										});
										$( "#changedbdialog" ).dialog("close")
									}
									else{
										$("#changedbdialog-message").text("Wrong Master Password");
										$("#changedbdialog-message").addClass("ui-state-error");
									}
								}
							});
						},
					},
					close: function() {
						$("#changedbdialog").hide()
					allFields.val( "" ).removeClass( "ui-state-error" );
					}
				});
				
			});
			
			$("#modifyaccountdialog").hide();
			$( "#importcsvdialog" ).hide();

			
			$( "#importcsv" )
			.button()
			.click(function() {
				html=' \
				';
				$( "#importcsvdialog" ).show()
				
				$("input[name='csv-format']").change(function(){

					if ($("input[name='csv-format']:checked").val() == '1') {
						$("#csv-group").html(input_group_html)
						$("#provide-csv-header").html('')
						header = "group,title,username,url,password,note,tag_list"
						$("#show-csv-format").text(header)
					} 
	
					if ($("input[name='csv-format']:checked").val() == '2') {
						input_group_html = '\
							<label for="input-group">Provide a group</label><br>\
							<input id="input-group" type="text" name="input-group"><br>\
						'
						$("#csv-group").html(input_group_html)
						$("#provide-csv-header").html('')
						header = "title,username,password,url,notes"
						$("#show-csv-format").text(header)
					} 
					if ($("input[name='csv-format']:checked").val() == '3') {
						$("#csv-group").html('')
						$("#provide-csv-header").html('')
						header = "uuid,group,title,username,password,notes"
						$("#show-csv-format").text(header)
					} 
					if ($("input[name='csv-format']:checked").val() == '4') {
						$("#csv-group").html('')
						input_group_html = '\
							<label for="input-header">Provide a header</label><br>\
							<input id="input-header" type="text" name="input-header"><br>\
						'
						$("#provide-csv-header").html('')
						$("#show-csv-format").text('custom format')
						header=input-header.val()
					} 
					
				});

				document.getElementById('csvfile').addEventListener('change', handleFileSelect, false);
				
				$( "#importcsvdialog" ).dialog({
				height: 500,
				width: 400,
				modal: true,
				buttons: {
					"Import": function (){
						if  ($("#input-group").val() != '') {
							provided_group=$("#input-group").val()
						}
						else {
							 provided_group=""
						}
						csvToJson(header +"\n"+ accountlist_import_file)
						/* method for version 0.9.11 */ /*
						accountlist_import_json = csvToJson(header +"\n"+ accountlist_import_file)
						accountlist_import_json = JSON.stringify({"objects": objArr })
						alert(accountlist_import_json)
						$.ajax({
							url: 'https://' + connectionURI + '/api/v1/account/',
							type: 'PATCH',
							contentType: 'application/json',
							dataType: 'json',
							data: accountlist_import_json,
							processData: false,
							success:  function(data, textStatus, jqXHR) {
								if (data.result==true) {
									reloadaccountdb();
									$("#importcsvdialog").dialog( "close" );
								}
							},
							error: function(){
									$("#importcsvdialog-message").text("Something went Wrong");
									$("#importcsvdialog-message").addClass("ui-state-error");
								}
						});*/
						/* method for version 0.9.10*/
						addedaccounts=0
						unaddedaccounts=0
						for (count=0;count<objArr.length;count++) { 
							account = JSON.stringify(objArr[count])
							$.ajax({
								url: 'https://' + connectionURI + '/api/v1/account/',
								type: 'POST',
								contentType: 'application/json',
								dataType: 'json',
								async: false,
								data: account,
								processData: false,
								success:  function(data, textStatus, jqXHR) {
									addedaccounts++
								},
								error: function(){
									unaddedaccounts++
								}
							});
							
						}
						if (unaddedaccounts>0) { 
							resulttext= "Error." + unaddedaccounts + " accounts were not added"
							$("#importcsvdialog-message").addClass("ui-state-error");
						}
						else {
							resulttext="All accounts added successfully"
							$("#importcsvdialog-message").addClass("ui-state-highlight");
						}	
						$("#importcsvdialog-message").text(resulttext);
						if (addedaccounts>0)
							reloadaccountdb();
					},
					Cancel: function (){ 
						$(this).dialog("close");
					}
				},
				close: function() {
					$("#importcsvdialog-message").text('');
					$("#importcsvdialog-message").removeClass("ui-state-highlight")
					$("#importcsvdialog-message").removeClass("ui-state-error")
					$("#importcsvdialog").hide()
				}
			});

			});

			$( "#searchbutton" )
			.button()
			.click(function() {
				var searchfields = $( "#searchfields" ),
					searchquery = $( "#searchquery" ),
					searchtext = $( "#searchtext" )
					$.getJSON('https://' + connectionURI + '/api/v1/account/search/?searchfields='+searchfields.val()+'&searchquery='+searchquery.val()+'&searchtext='+searchtext.val(), createtable)
			});
			$( "#searchtext" ).keypress(function(event){
				if(event.keyCode == 13){
					/*$("#searchbutton").click();*/
	                                var searchfields = $( "#searchfields" ),
                                        searchquery = $( "#searchquery" ),
                                        searchtext = $( "#searchtext" )
                                        $.getJSON('https://' + connectionURI + '/api/v1/account/search/?searchfields='+searchfields.val()+'&searchquery='+searchquery.val()+'&searchtext='+searchtext.val(), createtable)

				}
			});

			$("#searchresetbutton")
			.button()
			.click(function() {
				$("#searchtext").val("");
				reloadaccountdb();
			});


			$( "#mainblock" ).tabs();
			
			$("#changedb").click()


			$("#accounttable").tablesorterPager({container: $("#pager")});
		}
