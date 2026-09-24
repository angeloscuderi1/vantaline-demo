/*
 * Qualtrics deployment code for the Vantaline demo site.
 *
 * Paste the JavaScript from Qualtrics here (Website/App Feedback or DXA project
 * > Deployment > "Copy code"), without the surrounding <script> tags.
 * Every page on the site loads this file, so one paste covers the whole site.
 *
 * Context available to intercept logic, embedded data and DXA:
 *   JavaScript:  window.VL.customer.id, window.VL.customer.churnScore, window.VL.mode, window.VL.rageClicks
 *   Cookies:     vl_customer_id, vl_churn_score, vl_segment, vl_mode, vl_rage (set to 1 after a rage click)
 *   Page names:  document.body.dataset.page  (home, signin, account, billing, bill-faq, offers, support)
 */

/* ---- BEGIN QUALTRICS CODE ---- */
/* Project: Vantaline | Digital Experience (DXA), EY APJ Sandbox, ZN_3dLCCfY8ttz1eIV */
(function(){
  /* Container for embedded Qualtrics creatives (Qualtrics asks for this div on every page). */
  if(!document.getElementById("ZN_3dLCCfY8ttz1eIV")){var d=document.createElement("div");d.id="ZN_3dLCCfY8ttz1eIV";d.innerHTML="<!--DO NOT REMOVE-CONTENTS PLACED HERE-->";document.body.appendChild(d);}
})();
(function(){var g=function(g){
this.go=function(){var a=document.createElement("script");a.type="text/javascript";a.src=g;document.body&&document.body.appendChild(a)};
this.start=function(){var t=this;"complete"!==document.readyState?window.addEventListener?window.addEventListener("load",function(){t.go()},!1):window.attachEvent&&window.attachEvent("onload",function(){t.go()}):t.go()};};
try{(new g("https://zn3dlccfy8ttz1eiv-eyapjsandbox.siteintercept.qualtrics.com/SIE/?Q_ZID=ZN_3dLCCfY8ttz1eIV")).start()}catch(i){}})();
/* ---- END QUALTRICS CODE ---- */
