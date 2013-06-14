$.fn.CropImageXY = function(config) {
	var $this = this;

	var CropImageXY = function(container,config) {
		this.init(container, config);
	}
	
	
	CropImageXY.prototype = {
		
		DEFAULT_CONFIG : {
			width : 400,
			height : 400,
			cropFrameX : 50,
			cropFrameY : 50,
			cropFrameWidth : 200,
			cropFrameHeight : 200,
			cropRealWidth : 200,
			cropRealHeight : 200,
			borderColor : "green",
			startDrag : function() {},
			dragging : function() {},
			endDrag : function() {},
			loadImage : function() {}
			
		},
		
		container : null,
		
		cropFrame : null,
		
		image : null,
		
		config : null,
		
		cropZoom : 1,
		
		init : function(container, config) {
				this.container = container
				this.config = $.extend(this.DEFAULT_CONFIG, config);
				this.checkCropFrameCompareRealZoom();
				this.renderContainer();
				this.renderCropFrame();
				this.bindImageDrawEvent();
		},
		
		checkCropFrameCompareRealZoom : function() {
			var config = this.config;
			if (!config.cropRealWidth && !config.cropRealHeight) {
					this.cropZoom = 1;
					return;
			}
			if (config.cropRealHeight) {
					this.cropZoom = Math.round(config.cropRealHeight / config.cropFrameHeight * 10000) / 10000; 
			}
			
			if (config.cropRealWidth) {
					this.cropZoom = Math.round(config.cropRealWidth / config.cropFrameWidth * 10000) / 10000; 
			}
		},
		
		renderContainer : function() {
			var config = this.config;
			this.container.css({
				width : config.width,
				height : config.height,
				overflow : "hidden",
				position : "relative"
			});
		},
		
		renderCropFrame : function() {
			var config = this.config;
			var cropFrame = $("<div></div>");
			cropFrame.css({
				width : config.cropFrameWidth,
				height : config.cropFrameHeight,
				border : "1px solid " + config.borderColor,
				overflow : "hidden",
				position : "absolute",
				left : config.cropFrameX,
				top : config.cropFrameY,
				zIndex : 20
			}).appendTo(this.container);
			this.cropFrame = cropFrame;
		},
		
		getImagePositonAboutCenter : function() {
			var imageWidth = this.image.displayWidth,
					imageHeight = this.image.displayHeight,
					containerWidth = this.config.width,
					containerHeight = this.config.height;
			var left = (containerWidth - imageWidth) / 2,
					top = (containerHeight - imageHeight) / 2;
			return {
				left : left,
				top : top
			}
		},
		
		importImage : function(url) {
			this.container.find("img").remove();
			var config = this.config;
			var image = $("<img>")
					.css({
						position : "absolute"
					}).attr("src", url);
					
			var that = this;
			this.calImageWidthAndHeight(url, function(width, height) {
					image.realWidth = width;
					image.realHeight = height;
					image.displayWidth = width / that.cropZoom;
					image.displayHeight = height / that.cropZoom;
					that.image = image;
					var position = that.getImagePositonAboutCenter();
					image.css({
							width : image.displayWidth + "px",
							height : image.displayHeight + "px",
							top : position.top + "px",
							left : position.left + "px"
						}).bind("mousedown", function(e) {
							e.preventDefault();
						}).appendTo(that.container)
					that.config.loadImage();
			});
		},
		
		calImageWidthAndHeight : function(url, callback) {
			$("<img>").attr("src", url)
				.css({
					position : "absolute",
					left : "-2000px",
					top : "-2000px",
					visibility : "hidden",
					zIndex : "999"
				}).load(function() {
					var $this = $(this);
					callback($this.width(), $this.height());
					$this.remove();
				}).appendTo(document.body);
			
		},
		

		importLocalImage : function(uploadInput, callback) {
			if (!uploadInput) {
				this.importImage("");
				return;
			}
			uploadInput = $(uploadInput).get(0);
			var isIE = window.navigator.userAgent.indexOf("MSIE") >= 1;
			if (isIE) {
				uploadInput.select();
				this.importImage(document.selection.createRange().text);
				return;
			}

			if (uploadInput.files && uploadInput.files[0] 
					&& typeof uploadInput.files[0].getAsDataURL == "function") {
				this.importImage(uploadInput.files[0].getAsDataURL());
				return;
			}
			
			if (uploadInput.files && uploadInput.files[0] && window.URL && 
					typeof window.URL.createObjectURL == "function") {
				this.importImage(window.URL.createObjectURL(uploadInput.files[0]));
				return;
			}
			var that = this;
			if (typeof FileReader !== "undefined") {
					var reader = new FileReader(); 
					reader.onload = function(e){
						that.importImage(e.target.result);
					}  
					reader.readAsDataURL(uploadInput.files[0]);
			}
			this.importImage(uploadInput.value);
		},
		
		bindImageDrawEvent : function() {
			var selector = this.container.selector, that = this,
				isDraw = false, currentX = currentY = 0,
				moveX = moveY = 0, that = this;
			$(selector).live("mousedown", function(e) {
					currentX = e.originalEvent.x || e.originalEvent.layerX || 0; 
					currentY = e.originalEvent.y || e.originalEvent.layerY || 0; 
					isDraw = true;
					$(selector).css("cursor", "crosshair");
					that.config.startDrag();
			}).live("mouseup", function() {
					isDraw = false;
					currentX = currentY = 0;
					$(selector).css("cursor", "auto");
					that.config.endDrag();
			}).live("mouseleave", function() {
					isDraw = false;
					currentX = currentY = 0;
					$(selector).css("cursor", "auto");
					that.config.endDrag();
			}).live("mousemove", function(e) {
					if (!isDraw) return;
					var drawX = (e.originalEvent.x || e.originalEvent.layerX || 0) - currentX,
							drawY = (e.originalEvent.y || e.originalEvent.layerY || 0) - currentY;
							currentX = e.originalEvent.x || e.originalEvent.layerX || 0;
							currentY = e.originalEvent.y || e.originalEvent.layerY || 0; 
					var left = parseInt($(this).find("img").css("left"));
					var top = parseInt($(this).find("img").css("top"));
					left = $.isNumeric(left) ? left : 0;
					top = $.isNumeric(top) ? top : 0;
					$(this).find("img").css({
						top : top + drawY + "px",
						left : left + drawX + "px"
					});
					that.config.dragging();
			});
			//for ie
			document.ondragstart = function() { 
				return false;
			}
		},
		
		crop: function() {
			return {
				url : this.image.attr("src"),
				startX : -(parseInt(this.image.css("left")) - this.config.cropFrameX) * this.cropZoom,
				startY : -(parseInt(this.image.css("top")) - this.config.cropFrameY) * this.cropZoom,
				cropStartX : -(parseInt(this.image.css("left")) - this.config.cropFrameX),
				cropStartY : -(parseInt(this.image.css("top")) - this.config.cropFrameY),
				cropWidth : this.config.cropFrameWidth * this.cropZoom,
				cropHeight : this.config.cropFrameHeight * this.cropZoom,
				realWidth : this.image.realWidth,
				realHeight : this.image.realHeight,
				displayWidth : this.image.displayWidth,
				displayHeight : this.image.displayHeight
			};
		}
	}
	
	var cropImageXY = new CropImageXY($this, config);
	return cropImageXY;
}