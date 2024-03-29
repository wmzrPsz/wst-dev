/**
 * Copyright &copy; 2015-2020 <a href="http://www.jeeplus.org/">JeePlus</a> All rights reserved.
 */
package com.jeeplus.modules.sys.web;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.ConstraintViolationException;

import org.apache.shiro.authz.annotation.Logical;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.google.common.collect.Lists;
import com.jeeplus.common.utils.DateUtils;
import com.jeeplus.common.config.Global;
import com.jeeplus.common.json.AjaxJson;
import com.jeeplus.core.persistence.Page;
import com.jeeplus.core.web.BaseController;
import com.jeeplus.common.utils.StringUtils;
import com.jeeplus.common.utils.excel.ExportExcel;
import com.jeeplus.common.utils.excel.ImportExcel;
import com.jeeplus.modules.sys.entity.MemberDigg;
import com.jeeplus.modules.sys.service.MemberDiggService;

/**
 * 点赞Controller
 * @author dong
 * @version 2018-03-07
 */
@Controller
@RequestMapping(value = "${adminPath}/sys/memberDigg")
public class MemberDiggController extends BaseController {

	@Autowired
	private MemberDiggService memberDiggService;
	
	@ModelAttribute
	public MemberDigg get(@RequestParam(required=false) String id) {
		MemberDigg entity = null;
		if (StringUtils.isNotBlank(id)){
			entity = memberDiggService.get(id);
		}
		if (entity == null){
			entity = new MemberDigg();
		}
		return entity;
	}
	
	/**
	 * 点赞列表页面
	 */
	@RequiresPermissions("sys:memberDigg:list")
	@RequestMapping(value = {"list", ""})
	public String list() {
		return "modules/sys/memberDiggList";
	}
	
		/**
	 * 点赞列表数据
	 */
	@ResponseBody
	@RequiresPermissions("sys:memberDigg:list")
	@RequestMapping(value = "data")
	public Map<String, Object> data(MemberDigg memberDigg, HttpServletRequest request, HttpServletResponse response, Model model) {
		Page<MemberDigg> page = memberDiggService.findPage(new Page<MemberDigg>(request, response), memberDigg); 
		return getBootstrapData(page);
	}

	/**
	 * 查看，增加，编辑点赞表单页面
	 */
	@RequiresPermissions(value={"sys:memberDigg:view","sys:memberDigg:add","sys:memberDigg:edit"},logical=Logical.OR)
	@RequestMapping(value = "form")
	public String form(MemberDigg memberDigg, Model model) {
		model.addAttribute("memberDigg", memberDigg);
		return "modules/sys/memberDiggForm";
	}

	/**
	 * 保存点赞
	 */
	@ResponseBody
	@RequiresPermissions(value={"sys:memberDigg:add","sys:memberDigg:edit"},logical=Logical.OR)
	@RequestMapping(value = "save")
	public AjaxJson save(MemberDigg memberDigg, Model model, RedirectAttributes redirectAttributes) throws Exception{
		AjaxJson j = new AjaxJson();
		if (!beanValidator(model, memberDigg)){
			j.setSuccess(false);
			j.setMsg("非法参数！");
			return j;
		}
		memberDiggService.save(memberDigg);//新建或者编辑保存
		j.setSuccess(true);
		j.setMsg("保存点赞成功");
		return j;
	}
	
	/**
	 * 删除点赞
	 */
	@ResponseBody
	@RequiresPermissions("sys:memberDigg:del")
	@RequestMapping(value = "delete")
	public AjaxJson delete(MemberDigg memberDigg, RedirectAttributes redirectAttributes) {
		AjaxJson j = new AjaxJson();
		memberDiggService.delete(memberDigg);
		j.setMsg("删除点赞成功");
		return j;
	}
	
	/**
	 * 批量删除点赞
	 */
	@ResponseBody
	@RequiresPermissions("sys:memberDigg:del")
	@RequestMapping(value = "deleteAll")
	public AjaxJson deleteAll(String ids, RedirectAttributes redirectAttributes) {
		AjaxJson j = new AjaxJson();
		String idArray[] =ids.split(",");
		for(String id : idArray){
			memberDiggService.delete(memberDiggService.get(id));
		}
		j.setMsg("删除点赞成功");
		return j;
	}
	
	/**
	 * 导出excel文件
	 */
	@ResponseBody
	@RequiresPermissions("sys:memberDigg:export")
    @RequestMapping(value = "export", method=RequestMethod.POST)
    public AjaxJson exportFile(MemberDigg memberDigg, HttpServletRequest request, HttpServletResponse response, RedirectAttributes redirectAttributes) {
		AjaxJson j = new AjaxJson();
		try {
            String fileName = "点赞"+DateUtils.getDate("yyyyMMddHHmmss")+".xlsx";
            Page<MemberDigg> page = memberDiggService.findPage(new Page<MemberDigg>(request, response, -1), memberDigg);
    		new ExportExcel("点赞", MemberDigg.class).setDataList(page.getList()).write(response, fileName).dispose();
    		j.setSuccess(true);
    		j.setMsg("导出成功！");
    		return j;
		} catch (Exception e) {
			j.setSuccess(false);
			j.setMsg("导出点赞记录失败！失败信息："+e.getMessage());
		}
			return j;
    }

	/**
	 * 导入Excel数据

	 */
	@RequiresPermissions("sys:memberDigg:import")
    @RequestMapping(value = "import", method=RequestMethod.POST)
    public String importFile(MultipartFile file, RedirectAttributes redirectAttributes) {
		try {
			int successNum = 0;
			int failureNum = 0;
			StringBuilder failureMsg = new StringBuilder();
			ImportExcel ei = new ImportExcel(file, 1, 0);
			List<MemberDigg> list = ei.getDataList(MemberDigg.class);
			for (MemberDigg memberDigg : list){
				try{
					memberDiggService.save(memberDigg);
					successNum++;
				}catch(ConstraintViolationException ex){
					failureNum++;
				}catch (Exception ex) {
					failureNum++;
				}
			}
			if (failureNum>0){
				failureMsg.insert(0, "，失败 "+failureNum+" 条点赞记录。");
			}
			addMessage(redirectAttributes, "已成功导入 "+successNum+" 条点赞记录"+failureMsg);
		} catch (Exception e) {
			addMessage(redirectAttributes, "导入点赞失败！失败信息："+e.getMessage());
		}
		return "redirect:"+Global.getAdminPath()+"/sys/memberDigg/?repage";
    }
	
	/**
	 * 下载导入点赞数据模板
	 */
	@RequiresPermissions("sys:memberDigg:import")
    @RequestMapping(value = "import/template")
    public String importFileTemplate(HttpServletResponse response, RedirectAttributes redirectAttributes) {
		try {
            String fileName = "点赞数据导入模板.xlsx";
    		List<MemberDigg> list = Lists.newArrayList(); 
    		new ExportExcel("点赞数据", MemberDigg.class, 1).setDataList(list).write(response, fileName).dispose();
    		return null;
		} catch (Exception e) {
			addMessage(redirectAttributes, "导入模板下载失败！失败信息："+e.getMessage());
		}
		return "redirect:"+Global.getAdminPath()+"/sys/memberDigg/?repage";
    }

}