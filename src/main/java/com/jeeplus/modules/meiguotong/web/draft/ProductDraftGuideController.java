/**
 * Copyright &copy; 2015-2020 <a href="http://www.jeeplus.org/">JeePlus</a> All rights reserved.
 */
package com.jeeplus.modules.meiguotong.web.draft;

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
import com.jeeplus.modules.meiguotong.entity.draft.ProductDraftGuide;
import com.jeeplus.modules.meiguotong.service.draft.ProductDraftGuideService;

/**
 * 草稿导游Controller
 * @author dong
 * @version 2018-09-14
 */
@Controller
@RequestMapping(value = "${adminPath}/meiguotong/draft/productDraftGuide")
public class ProductDraftGuideController extends BaseController {

	@Autowired
	private ProductDraftGuideService productDraftGuideService;
	
	@ModelAttribute
	public ProductDraftGuide get(@RequestParam(required=false) String id) {
		ProductDraftGuide entity = null;
		if (StringUtils.isNotBlank(id)){
			entity = productDraftGuideService.get(id);
		}
		if (entity == null){
			entity = new ProductDraftGuide();
		}
		return entity;
	}
	
	/**
	 * 草稿导游列表页面
	 */
	@RequiresPermissions("meiguotong:draft:productDraftGuide:list")
	@RequestMapping(value = {"list", ""})
	public String list() {
		return "modules/meiguotong/draft/productDraftGuideList";
	}
	
		/**
	 * 草稿导游列表数据
	 */
	@ResponseBody
	@RequiresPermissions("meiguotong:draft:productDraftGuide:list")
	@RequestMapping(value = "data")
	public Map<String, Object> data(ProductDraftGuide productDraftGuide, HttpServletRequest request, HttpServletResponse response, Model model) {
		Page<ProductDraftGuide> page = productDraftGuideService.findPage(new Page<ProductDraftGuide>(request, response), productDraftGuide); 
		return getBootstrapData(page);
	}

	/**
	 * 查看，增加，编辑草稿导游表单页面
	 */
	@RequiresPermissions(value={"meiguotong:draft:productDraftGuide:view","meiguotong:draft:productDraftGuide:add","meiguotong:draft:productDraftGuide:edit"},logical=Logical.OR)
	@RequestMapping(value = "form")
	public String form(ProductDraftGuide productDraftGuide, Model model) {
		model.addAttribute("productDraftGuide", productDraftGuide);
		return "modules/meiguotong/draft/productDraftGuideForm";
	}

	/**
	 * 保存草稿导游
	 */
	@ResponseBody
	@RequiresPermissions(value={"meiguotong:draft:productDraftGuide:add","meiguotong:draft:productDraftGuide:edit"},logical=Logical.OR)
	@RequestMapping(value = "save")
	public AjaxJson save(ProductDraftGuide productDraftGuide, Model model, RedirectAttributes redirectAttributes) throws Exception{
		AjaxJson j = new AjaxJson();
		if (!beanValidator(model, productDraftGuide)){
			j.setSuccess(false);
			j.setMsg("非法参数！");
			return j;
		}
		productDraftGuideService.save(productDraftGuide);//新建或者编辑保存
		j.setSuccess(true);
		j.setMsg("保存草稿导游成功");
		return j;
	}
	
	/**
	 * 删除草稿导游
	 */
	@ResponseBody
	@RequiresPermissions("meiguotong:draft:productDraftGuide:del")
	@RequestMapping(value = "delete")
	public AjaxJson delete(ProductDraftGuide productDraftGuide, RedirectAttributes redirectAttributes) {
		AjaxJson j = new AjaxJson();
		productDraftGuideService.delete(productDraftGuide);
		j.setMsg("删除草稿导游成功");
		return j;
	}
	
	/**
	 * 批量删除草稿导游
	 */
	@ResponseBody
	@RequiresPermissions("meiguotong:draft:productDraftGuide:del")
	@RequestMapping(value = "deleteAll")
	public AjaxJson deleteAll(String ids, RedirectAttributes redirectAttributes) {
		AjaxJson j = new AjaxJson();
		String idArray[] =ids.split(",");
		for(String id : idArray){
			productDraftGuideService.delete(productDraftGuideService.get(id));
		}
		j.setMsg("删除草稿导游成功");
		return j;
	}
	
	/**
	 * 导出excel文件
	 */
	@ResponseBody
	@RequiresPermissions("meiguotong:draft:productDraftGuide:export")
    @RequestMapping(value = "export", method=RequestMethod.POST)
    public AjaxJson exportFile(ProductDraftGuide productDraftGuide, HttpServletRequest request, HttpServletResponse response, RedirectAttributes redirectAttributes) {
		AjaxJson j = new AjaxJson();
		try {
            String fileName = "草稿导游"+DateUtils.getDate("yyyyMMddHHmmss")+".xlsx";
            Page<ProductDraftGuide> page = productDraftGuideService.findPage(new Page<ProductDraftGuide>(request, response, -1), productDraftGuide);
    		new ExportExcel("草稿导游", ProductDraftGuide.class).setDataList(page.getList()).write(response, fileName).dispose();
    		j.setSuccess(true);
    		j.setMsg("导出成功！");
    		return j;
		} catch (Exception e) {
			j.setSuccess(false);
			j.setMsg("导出草稿导游记录失败！失败信息："+e.getMessage());
		}
			return j;
    }

	/**
	 * 导入Excel数据

	 */
	@RequiresPermissions("meiguotong:draft:productDraftGuide:import")
    @RequestMapping(value = "import", method=RequestMethod.POST)
    public String importFile(MultipartFile file, RedirectAttributes redirectAttributes) {
		try {
			int successNum = 0;
			int failureNum = 0;
			StringBuilder failureMsg = new StringBuilder();
			ImportExcel ei = new ImportExcel(file, 1, 0);
			List<ProductDraftGuide> list = ei.getDataList(ProductDraftGuide.class);
			for (ProductDraftGuide productDraftGuide : list){
				try{
					productDraftGuideService.save(productDraftGuide);
					successNum++;
				}catch(ConstraintViolationException ex){
					failureNum++;
				}catch (Exception ex) {
					failureNum++;
				}
			}
			if (failureNum>0){
				failureMsg.insert(0, "，失败 "+failureNum+" 条草稿导游记录。");
			}
			addMessage(redirectAttributes, "已成功导入 "+successNum+" 条草稿导游记录"+failureMsg);
		} catch (Exception e) {
			addMessage(redirectAttributes, "导入草稿导游失败！失败信息："+e.getMessage());
		}
		return "redirect:"+Global.getAdminPath()+"/meiguotong/draft/productDraftGuide/?repage";
    }
	
	/**
	 * 下载导入草稿导游数据模板
	 */
	@RequiresPermissions("meiguotong:draft:productDraftGuide:import")
    @RequestMapping(value = "import/template")
    public String importFileTemplate(HttpServletResponse response, RedirectAttributes redirectAttributes) {
		try {
            String fileName = "草稿导游数据导入模板.xlsx";
    		List<ProductDraftGuide> list = Lists.newArrayList(); 
    		new ExportExcel("草稿导游数据", ProductDraftGuide.class, 1).setDataList(list).write(response, fileName).dispose();
    		return null;
		} catch (Exception e) {
			addMessage(redirectAttributes, "导入模板下载失败！失败信息："+e.getMessage());
		}
		return "redirect:"+Global.getAdminPath()+"/meiguotong/draft/productDraftGuide/?repage";
    }

}