// ============================================================
// canva-integration.js - SỬA LỖI MỞ URL CANVA VÀ XUẤT CSV TẠO HÀNG LOẠT
// (ĐÃ TÍCH HỢP SẴN THƯ VIỆN FILESAVER.JS)
// ============================================================

/* 
 * ============================================================
 * THƯ VIỆN FileSaver.js (Phiên bản tích hợp nguyên khối)
 * Được sử dụng để lưu file Blob (CSV) trực tiếp từ trình duyệt
 * ============================================================
 */
var saveAs = saveAs || (function(view) {
    "use strict";
    if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
        return;
    }
    var doc = view.document
      , get_URL = function() {
          return view.URL || view.webkitURL || view;
      }
      , save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
      , can_use_save_link = "download" in save_link
      , click = function(node) {
          var event = new MouseEvent("click");
          node.dispatchEvent(event);
      }
      , throw_outside = function(ex) {
          (view.setImmediate || view.setTimeout)(function() {
              throw ex;
          }, 0);
      }
      , force_saveable_type = "application/octet-stream"
      , arbitrary_revoke_timeout = 500 // in ms
      , revoke = function(file) {
          var revoker = function() {
              if (typeof file === "string") { // file is an object URL
                  get_URL().revokeObjectURL(file);
              } else { // file is a File
                  file.remove();
              }
          };
          setTimeout(revoker, arbitrary_revoke_timeout);
      }
      , dispatch = function(filesaver, stat, opts) {
          opts = [].concat(opts);
          var i = opts.length;
          while (i--) {
              var listener = filesaver["on" + opts[i]];
              if (typeof listener === "function") {
                  try {
                      listener.call(filesaver, stat || filesaver);
                  } catch (ex) {
                      throw_outside(ex);
                  }
              }
          }
      }
      , auto_bom = function(blob) {
          if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
              return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
          }
          return blob;
      }
      , FileSaver = function(blob, name, no_auto_bom) {
          if (!no_auto_bom) {
              blob = auto_bom(blob);
          }
          var filesaver = this
            , type = blob.type
            , force = type === force_saveable_type
            , object_url
            , dispatch_all = function() {
                dispatch(filesaver, "writestart progress write writeend".split(" "));
            }
            , fs_error = function() {
                if ((force || !object_url) && view.FileReader) {
                    var reader = new FileReader();
                    reader.onloadend = function() {
                        var url = reader.result;
                        object_url = url;
                        save_link.href = url;
                        save_link.download = name;
                        click(save_link);
                        dispatch(filesaver, "progress", "writeend");
                    };
                    reader.readAsDataURL(blob);
                    filesaver.readyState = filesaver.INIT;
                    return;
                }
                if (!object_url) {
                    object_url = get_URL().createObjectURL(blob);
                }
                if (force) {
                    view.location.href = object_url;
                } else {
                    var opened = view.open(object_url, "_blank");
                    if (!opened) {
                        view.location.href = object_url;
                    }
                }
                filesaver.readyState = filesaver.DONE;
                dispatch_all();
                revoke(object_url);
            };
          filesaver.readyState = filesaver.INIT;

          if (can_use_save_link) {
              object_url = get_URL().createObjectURL(blob);
              setTimeout(function() {
                  save_link.href = object_url;
                  save_link.download = name;
                  click(save_link);
                  dispatch_all();
                  revoke(object_url);
                  filesaver.readyState = filesaver.DONE;
              });
              return;
          }

          fs_error();
      }
      , FS_proto = FileSaver.prototype
      , saveAs = function(blob, name, no_auto_bom) {
          return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
      }
    ;
    if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
        return function(blob, name, no_auto_bom) {
            name = name || blob.name || "download";
            if (!no_auto_bom) {
                blob = auto_bom(blob);
            }
            return navigator.msSaveOrOpenBlob(blob, name);
        };
    }

    FS_proto.abort = function(){};
    FS_proto.readyState = FS_proto.INIT = 0;
    FS_proto.WRITING = 1;
    FS_proto.DONE = 2;

    FS_proto.error =
    FS_proto.onwritestart =
    FS_proto.onprogress =
    FS_proto.onwrite =
    FS_proto.onabort =
    FS_proto.onerror =
    FS_proto.onwriteend =
        null;

    return saveAs;
}(
   typeof self !== "undefined" && self
|| typeof window !== "undefined" && window
|| this
));

/* 
 * ============================================================
 * ỨNG DỤNG CHÍNH: XUẤT CSV CHO CANVA
 * ============================================================
 */

/**
 * 1. Mở chính xác giao diện thiết kế bài giảng của Canva
 */
function openCanvaAIPresentation() {
    // Sửa URL mở trực tiếp mẫu Presentation trên Canva
    const canvaDirectUrl = "https://www.canva.com/presentations/templates/";
    window.open(canvaDirectUrl, "_blank");
}

/**
 * 2. Tự động đóng gói nội dung slide thành CSV tương thích với Canva Bulk Create
 */
function exportCanvaBulkCSV() {
    const data = typeof getCurrentPresentation === "function" ? getCurrentPresentation() : null;
    if (!data?.slides?.length) {
        alert("Chưa có bài giảng để xuất sang Canva.");
        return;
    }

    // Tiêu đề cột dùng cho Canva Bulk Create
    let csvContent = "\uFEFFSlide_Number,Slide_Title,Slide_Content,Question,Options,Answer,SGK_Source\n";

    data.slides.forEach((slide, index) => {
        const slideNum = index + 1;
        const title = `"${(slide.title || "").replace(/"/g, '""')}"`;
        const content = `"${(slide.content || []).join(" | ").replace(/"/g, '""')}"`;
        const question = `"${(slide.interaction?.question || "").replace(/"/g, '""')}"`;
        const options = `"${(slide.interaction?.options || []).join(" | ").replace(/"/g, '""')}"`;
        const answer = `"${(slide.interaction?.answer || "").replace(/"/g, '""')}"`;
        const citation = `"${(slide.sgkCitation || "").replace(/"/g, '""')}"`;

        csvContent += `${slideNum},${title},${content},${question},${options},${answer},${citation}\n`;
    });

    // Tạo file CSV và tải về máy (Sử dụng hàm saveAs được tích hợp ở trên)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = `Canva_Data_${sanitizePresentationFileName(data.presentation?.title || "Bai_Giang")}.csv`;
    saveAs(blob, fileName);

    // Mở trang Canva
    openCanvaAIPresentation();
}
