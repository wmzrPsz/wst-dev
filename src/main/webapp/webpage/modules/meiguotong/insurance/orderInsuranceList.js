<%@ page contentType="text/html;charset=UTF-8" %>
<script>
$(document).ready(function() {
	if ($("#type").val()==1) {
		
	$('#orderInsuranceTable').bootstrapTable({
		 
		  //请求方法
               method: 'get',
               //类型json
               dataType: "json",
               //显示刷新按钮
               showRefresh: true,
               //显示切换手机试图按钮
               showToggle: true,
               //显示 内容列下拉框
    	       showColumns: true,
    	       //显示到处按钮
    	       showExport: true,
    	       //显示切换分页按钮
    	       showPaginationSwitch: true,
    	       //最低显示2行
    	       minimumCountColumns: 2,
               //是否显示行间隔色
               striped: true,
               //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）     
               cache: false,    
               //是否显示分页（*）  
               pagination: true,   
                //排序方式 
               sortOrder: "asc",  
               //初始化加载第一页，默认第一页
               pageNumber:1,   
               //每页的记录行数（*）   
               pageSize: 10,  
               //可供选择的每页的行数（*）    
               pageList: [10, 25, 50, 100],
               //这个接口需要处理bootstrap table传递的固定参数,并返回特定格式的json数据  
               url: "${ctx}/meiguotong/insurance/orderInsurance/data",
               //默认值为 'limit',传给服务端的参数为：limit, offset, search, sort, order Else
               //queryParamsType:'',   
               ////查询参数,每次调用是会带上这个参数，可自定义                         
               queryParams : function(params) {
               	var searchParam = $("#searchForm").serializeJSON();
               	searchParam.pageNo = params.limit === undefined? "1" :params.offset/params.limit+1;
               	searchParam.pageSize = params.limit === undefined? -1 : params.limit;
               	searchParam.orderBy = params.sort === undefined? "" : params.sort+ " "+  params.order;
                   return searchParam;
               },
               //分页方式：client客户端分页，server服务端分页（*）
               sidePagination: "server",
               contextMenuTrigger:"right",//pc端 按右键弹出菜单
               contextMenuTriggerMobile:"press",//手机端 弹出菜单，click：单击， press：长按。
               contextMenu: '#context-menu',
               onContextMenuItem: function(row, $el){
                   if($el.data("item") == "edit"){
                   	window.location = "${ctx}/meiguotong/insurance/orderInsurance/form?id=" + row.id;
                   } else if($el.data("item") == "delete"){
                        jp.confirm('确认要删除该保险订单记录吗？', function(){
                       	jp.loading();
                       	jp.get("${ctx}/meiguotong/insurance/orderInsurance/delete?id="+row.id, function(data){
                   	  		if(data.success){
                   	  			$('#orderInsuranceTable').bootstrapTable('refresh');
                   	  			jp.success(data.msg);
                   	  		}else{
                   	  			jp.error(data.msg);
                   	  		}
                   	  	})
                   	   
                   	});
                      
                   } 
               },
              
               onClickRow: function(row, $el){
               },
               columns: [{
		        checkbox: true
		       
		    }
   			,{
		        field: 'orderNo',
		        title: '订单号',
		        sortable: true
		       
		    }
   			,{
		        field: 'name',
		        title: '产品名称',
		        sortable: true
		       
		    }
			,{
		        field: 'contacts',
		        title: '联系信息',
		        sortable: true,
		        formatter:function(value,row,index){
			    	return (value!=null?value:"")+(row.contactMobile!=null?","+row.contactMobile:"")+(row.contactRemark!=null?","+row.contactRemark:"");
		        }
		    }
			,{
				field: 'num',
				title: '预定数量',
				sortable: true
			}
			,{
				field: 'companyName',
				title: '供应商',
				sortable: true
			}
			,{
				field: 'memberid',
				title: '下单人ID',
				sortable: true
			}
			,{
		        field: 'createDate',
		        title: '下单时间',
		        sortable: true
		       
		    }
			,{
				field: 'useDate',
				title: '使用时间',
				sortable: true
				
			}
			,{
		        field: 'price',
		        title: '订单金额',
		        sortable: true
		       
		    }
			,{
		        field: 'status',
		        title: '订单状态 ',
		        sortable: true,
		        formatter:function(value,row,index){
			    	if(value == 1) return "待付款";
			    	if(value == 2) return "待确定";
			    	if(value == 3) return "待出行";
			    	if(value == 4) return "待评价";
			    	if(value == 5) return "已完成";
			    	if(value == 6) return "已取消";
			    	if(value == 7) return "申请退款";
			    	if(value == 8) return "退款中";
			    	if(value == 9) return "退款成功";
			    	if(value == 10) return "退款失败";
		        }
		    }
		    , {
                field: 'operate',
                title: '操作',
                align: 'center',
                events: {
    		      'click .sure': function (e, value, row, index) { 
    		    	  sureOrder(row);
    		        },
    		        'click .cancel': function (e, value, row, index) { 
    		        	cancelOrder(row);
    		        },
    		        'click .refund': function (e, value, row, index) { 
    		        	refundOrder(row);
    		        },
    		        'click .agree': function (e, value, row, index) { 
    		        	agreeOrder(row);
    		        },
    		        'click .confirm': function (e, value, row, index) { 
    		        	confirmorder(row);
    		        },
    		        'click .refuse': function (e, value, row, index) { 
    		        	refuseOrder(row);
    		        },
    		    },
                formatter:  function operateFormatter(value, row, index) {
    		        return [
						'<a href="${ctx}/meiguotong/insurance/orderInsurance/form2?id='+row.id+'" class="view" title="查看" >'+
						'<i class="fa fa-eye btn btn-primary btn-xs">查看</i> </a>',
					row.status==2?'<a href="#" class="sure"  title="确定订单"><i class="fa fa-edit btn btn-warning btn-xs">确定订单</i> </a>':'',
					row.status==1?'<a href="#" class="cancel" title="取消订单"><i class="fa fa-edit btn btn-danger btn-xs">取消订单</i> </a>':'',
					row.status==2?'<a href="#" class="cancel" title="取消订单"><i class="fa fa-edit btn btn-danger btn-xs">取消订单</i> </a>':'',
					row.status==3?'<a href="#" class="cancel" title="取消订单"><i class="fa fa-edit btn btn-danger btn-xs">取消订单</i> </a>':'',
					row.status==7?'<a href="#" class="agree"  title="同意退款"><i class="fa fa-edit btn btn-warning btn-xs">同意退款</i> </a>':'',
					row.status==8?'<a href="#" class="confirm"  title="确定退款"><i class="fa fa-edit btn btn-warning btn-xs">确定退款</i> </a>':'',
					row.status==7?'<a href="#" class="refuse" title="拒绝退款"><i class="fa fa-edit btn btn-danger btn-xs">拒绝退款</i> </a>':'',
    		        ].join('');
    		    }
            }
		     ]
		
		});
	}
	if ($("#type").val()==2) {
		
		$('#orderInsuranceTable').bootstrapTable({
			 
			  //请求方法
	               method: 'get',
	               //类型json
	               dataType: "json",
	               //显示刷新按钮
	               showRefresh: true,
	               //显示切换手机试图按钮
	               showToggle: true,
	               //显示 内容列下拉框
	    	       showColumns: true,
	    	       //显示到处按钮
	    	       showExport: true,
	    	       //显示切换分页按钮
	    	       showPaginationSwitch: true,
	    	       //最低显示2行
	    	       minimumCountColumns: 2,
	               //是否显示行间隔色
	               striped: true,
	               //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）     
	               cache: false,    
	               //是否显示分页（*）  
	               pagination: true,   
	                //排序方式 
	               sortOrder: "asc",  
	               //初始化加载第一页，默认第一页
	               pageNumber:1,   
	               //每页的记录行数（*）   
	               pageSize: 10,  
	               //可供选择的每页的行数（*）    
	               pageList: [10, 25, 50, 100],
	               //这个接口需要处理bootstrap table传递的固定参数,并返回特定格式的json数据  
	               url: "${ctx}/meiguotong/insurance/orderInsurance/data",
	               //默认值为 'limit',传给服务端的参数为：limit, offset, search, sort, order Else
	               //queryParamsType:'',   
	               ////查询参数,每次调用是会带上这个参数，可自定义                         
	               queryParams : function(params) {
	               	var searchParam = $("#searchForm").serializeJSON();
	               	searchParam.pageNo = params.limit === undefined? "1" :params.offset/params.limit+1;
	               	searchParam.pageSize = params.limit === undefined? -1 : params.limit;
	               	searchParam.orderBy = params.sort === undefined? "" : params.sort+ " "+  params.order;
	                   return searchParam;
	               },
	               //分页方式：client客户端分页，server服务端分页（*）
	               sidePagination: "server",
	               contextMenuTrigger:"right",//pc端 按右键弹出菜单
	               contextMenuTriggerMobile:"press",//手机端 弹出菜单，click：单击， press：长按。
	               contextMenu: '#context-menu',
	               onContextMenuItem: function(row, $el){
	                   if($el.data("item") == "edit"){
	                   	window.location = "${ctx}/meiguotong/insurance/orderInsurance/form?id=" + row.id;
	                   } else if($el.data("item") == "delete"){
	                        jp.confirm('确认要删除该保险订单记录吗？', function(){
	                       	jp.loading();
	                       	jp.get("${ctx}/meiguotong/insurance/orderInsurance/delete?id="+row.id, function(data){
	                   	  		if(data.success){
	                   	  			$('#orderInsuranceTable').bootstrapTable('refresh');
	                   	  			jp.success(data.msg);
	                   	  		}else{
	                   	  			jp.error(data.msg);
	                   	  		}
	                   	  	})
	                   	   
	                   	});
	                      
	                   } 
	               },
	              
	               onClickRow: function(row, $el){
	               },
	               columns: [{
			        checkbox: true
			       
			    }
	   			,{
			        field: 'orderNo',
			        title: '订单号',
			        sortable: true
			       
			    }
	   			,{
	   				field: 'afterNo',
	   				title: '售后订单号',
	   				sortable: true
	   				
	   			}
	   			,{
			        field: 'name',
			        title: '产品名称',
			        sortable: true
			       
			    }
				,{
			        field: 'contacts',
			        title: '联系信息',
			        sortable: true,
			        formatter:function(value,row,index){
				    	return (value!=null?value:"")+(row.contactMobile!=null?","+row.contactMobile:"")+(row.contactRemark!=null?","+row.contactRemark:"");
			        }
			    }
				,{
					field: 'num',
					title: '预定数量',
					sortable: true
				}
				,{
					field: 'companyName',
					title: '供应商',
					sortable: true
				}
				,{
					field: 'memberid',
					title: '下单人ID',
					sortable: true
				}
				,{
			        field: 'createDate',
			        title: '下单时间',
			        sortable: true
			       
			    }
				,{
					field: 'useDate',
					title: '使用时间',
					sortable: true
					
				}
				,{
			        field: 'price',
			        title: '订单金额',
			        sortable: true
			       
			    }
	   			,{
	   				field: 'refundPrice',
	   				title: '退款金额',
	   				sortable: true
	   				
	   			}
				,{
			        field: 'status',
			        title: '订单状态 ',
			        sortable: true,
			        formatter:function(value,row,index){
				    	if(value == 1) return "待付款";
				    	if(value == 2) return "待确定";
				    	if(value == 3) return "待出行";
				    	if(value == 4) return "待评价";
				    	if(value == 5) return "已完成";
				    	if(value == 6) return "已取消";
				    	if(value == 7) return "申请退款";
				    	if(value == 8) return "退款中";
				    	if(value == 9) return "退款成功";
				    	if(value == 10) return "退款失败";
			        }
			    }
			    , {
	                field: 'operate',
	                title: '操作',
	                align: 'center',
	                events: {
	    		      'click .sure': function (e, value, row, index) { 
	    		    	  sureOrder(row);
	    		        },
	    		        'click .cancel': function (e, value, row, index) { 
	    		        	cancelOrder(row);
	    		        },
	    		        'click .refund': function (e, value, row, index) { 
	    		        	refundOrder(row);
	    		        },
	    		        'click .agree': function (e, value, row, index) { 
	    		        	agreeOrder(row);
	    		        },
	    		        'click .confirm': function (e, value, row, index) { 
	    		        	confirmorder(row);
	    		        },
	    		        'click .refuse': function (e, value, row, index) { 
	    		        	refuseOrder(row);
	    		        },
	    		    },
	                formatter:  function operateFormatter(value, row, index) {
	    		        return [
							'<a href="${ctx}/meiguotong/insurance/orderInsurance/form2?id='+row.id+'" class="view" title="查看" >'+
							'<i class="fa fa-eye btn btn-primary btn-xs">查看</i> </a>',
						row.status==2?'<a href="#" class="sure"  title="确定订单"><i class="fa fa-edit btn btn-warning btn-xs">确定订单</i> </a>':'',
						row.status==1?'<a href="#" class="cancel" title="取消订单"><i class="fa fa-edit btn btn-danger btn-xs">取消订单</i> </a>':'',
						row.status==2?'<a href="#" class="cancel" title="取消订单"><i class="fa fa-edit btn btn-danger btn-xs">取消订单</i> </a>':'',
						row.status==3?'<a href="#" class="cancel" title="取消订单"><i class="fa fa-edit btn btn-danger btn-xs">取消订单</i> </a>':'',
						row.status==3?'<a href="#" class="refund" title="退款"><i class="fa fa-edit btn btn-primary btn-xs">退款</i> </a>':'',
						row.status==7?'<a href="#" class="agree"  title="同意退款"><i class="fa fa-edit btn btn-warning btn-xs">同意退款</i> </a>':'',
						row.status==8?'<a href="#" class="confirm"  title="确定退款"><i class="fa fa-edit btn btn-warning btn-xs">确定退款</i> </a>':'',
						row.status==7?'<a href="#" class="refuse" title="拒绝退款"><i class="fa fa-edit btn btn-danger btn-xs">拒绝退款</i> </a>':'',
	    		        ].join('');
	    		    }
	            }
			     ]
			
			});
		}
	 
	function sureOrder(row){
		jp.confirm('是否确定订单？', function(){
          	jp.loading();
          	jp.get("${ctx}/meiguotong/insurance/orderInsurance/sureOrder?id="+row.id, function(data){
      	  		if(data.success){
      	  			$('#orderInsuranceTable').bootstrapTable('refresh');
      	  			jp.success(data.msg);
      	  		}else{
      	  			jp.error(data.msg);
      	  		}
      	  	})
      	});
	}
	function cancelOrder(row){
		jp.confirm('确认取消订单吗？', function(){
			jp.loading();
			jp.get("${ctx}/meiguotong/insurance/orderInsurance/cancelOrder?id="+row.id, function(data){
				if(data.success){
					$('#orderInsuranceTable').bootstrapTable('refresh');
					jp.success(data.msg);
				}else{
					jp.error(data.msg);
				}
			})
		});
	}
	function refundOrder(row){
		jp.confirm('确认申请退款吗？', function(){
			jp.loading();
			jp.get("${ctx}/meiguotong/insurance/orderInsurance/refundOrder?id="+row.id, function(data){
				if(data.success){
					$('#orderInsuranceTable').bootstrapTable('refresh');
					jp.success(data.msg);
				}else{
					jp.error(data.msg);
				}
			})
		});
	}
	function agreeOrder(row){
		jp.confirm('确定同意退款吗？', function(){
			jp.loading();
			jp.get("${ctx}/meiguotong/insurance/orderInsurance/agreeOrder?id="+row.id, function(data){
				if(data.success){
					$('#orderInsuranceTable').bootstrapTable('refresh');
					jp.success(data.msg);
				}else{
					jp.error(data.msg);
				}
			})
		});
	}
	function confirmorder(row){
		jp.confirm('确定退款吗？', function(){
			jp.loading();
			jp.get("${ctx}/meiguotong/insurance/orderInsurance/confirmorder?id="+row.id, function(data){
				if(data.success){
					$('#orderInsuranceTable').bootstrapTable('refresh');
					jp.success(data.msg);
				}else{
					jp.error(data.msg);
				}
			})
		});
	}
	function refuseOrder(row){
		jp.confirm('确定拒绝退款吗？', function(){
			jp.loading();
			jp.get("${ctx}/meiguotong/insurance/orderInsurance/refuseOrder?id="+row.id, function(data){
				if(data.success){
					$('#orderInsuranceTable').bootstrapTable('refresh');
					jp.success(data.msg);
				}else{
					jp.error(data.msg);
				}
			})
		});
	}
	
	
	  if(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)){//如果是移动端

		 
		  $('#orderInsuranceTable').bootstrapTable("toggleView");
		}
	  
	  $('#orderInsuranceTable').on('check.bs.table uncheck.bs.table load-success.bs.table ' +
                'check-all.bs.table uncheck-all.bs.table', function () {
            $('#remove').prop('disabled', ! $('#orderInsuranceTable').bootstrapTable('getSelections').length);
            $('#edit').prop('disabled', $('#orderInsuranceTable').bootstrapTable('getSelections').length!=1);
        });
		  
		$("#btnImport").click(function(){
			jp.open({
			    type: 1, 
			    area: [500, 300],
			    title:"导入数据",
			    content:$("#importBox").html() ,
			    btn: ['下载模板','确定', '关闭'],
				    btn1: function(index, layero){
					  window.location='${ctx}/meiguotong/insurance/orderInsurance/import/template';
				  },
			    btn2: function(index, layero){
				        var inputForm =top.$("#importForm");
				        var top_iframe = top.getActiveTab().attr("name");//获取当前active的tab的iframe 
				        inputForm.attr("target",top_iframe);//表单提交成功后，从服务器返回的url在当前tab中展示
				        inputForm.onsubmit = function(){
				        	jp.loading('  正在导入，请稍等...');
				        }
				        inputForm.submit();
					    jp.close(index);
				  },
				 
				  btn3: function(index){ 
					  jp.close(index);
	    	       }
			}); 
		});
		    
	  $("#search").click("click", function() {// 绑定查询按扭
		  $('#orderInsuranceTable').bootstrapTable('refresh');
		});
	 
	 $("#reset").click("click", function() {// 绑定查询按扭
		  $("#searchForm  input[type!=hidden]").val("");
		  $("#searchForm  select").val("");
		  $("#searchForm  .select-item").html("");
		  $('#orderInsuranceTable').bootstrapTable('refresh');
		});
		
	 //调用日期
		$('#beginDate').datetimepicker({
			 format: "YYYY-MM-DD"
		});	
		$('#endDate').datetimepicker({
			 format: "YYYY-MM-DD"
		});	
		
	});
		
  function getIdSelections() {
        return $.map($("#orderInsuranceTable").bootstrapTable('getSelections'), function (row) {
            return row.id
        });
    }
  
  function deleteAll(){

		jp.confirm('确认要删除该保险订单记录吗？', function(){
			jp.loading();  	
			jp.get("${ctx}/meiguotong/insurance/orderInsurance/deleteAll?ids=" + getIdSelections(), function(data){
         	  		if(data.success){
         	  			$('#orderInsuranceTable').bootstrapTable('refresh');
         	  			jp.success(data.msg);
         	  		}else{
         	  			jp.error(data.msg);
         	  		}
         	  	})
          	   
		})
  }
  function edit(){
	  window.location = "${ctx}/meiguotong/insurance/orderInsurance/form?id=" + getIdSelections();
  }
  
</script>