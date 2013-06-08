	$.fn.cropImage = function(config) {
					var $this = this;
					var CropImage = function(container, config) {
						this.init(container, config);
					}
					
					CropImage.prototype = {
							
							container : null,
							
							config : null,
							
							canvas : null,
							
							moveX : 0,
							
							moveY : 0,
							
							image : 0,
							
							DEFALUT_CONFIG : {
								width : 100,
								height : 100,
								cropFrameX : 50,
								cropFrameY : 50,
								cropFrameWidth : 50,
								cropFrameHeight : 50,
								bgUrl : "",
								uploadBtnId : ""
							},
							
							init : function(container, config) {
								this.container = container
								this.config = $.extend(this.DEFALUT_CONFIG, config);
								var $canvas = this.renderCanvas();
								this.canvas = $canvas;
								this.ctx = $canvas.get(0).getContext("2d");
								
								this.drawRect();
								this.bindDragImageInCanvasEvent();
								this.bindUploadImageEvent();
							},
							
							renderCanvas : function() {
								var config = this.config;
								var $canvas = $("<canvas>").css({
									width : config.width + "px",
									height : config.height + "px"
								}).attr({
									width : config.width,
									height : config.height
								}).appendTo(this.container);
								
								if (config.bgUrl) {
									$canvas.css("backgroundImage", "url(" + config.bgUrl + ")");
								}
								return $canvas;
							},
							
							
							bindUploadImageEvent : function() {
								var uploadBtnId = config.uploadBtnId;
								if (!uploadBtnId) return;
								var that = this;
								
								var parseImage = function(event) {
									var f = event.target.files[0];
									var reader = new FileReader();
								 	reader.onload = function(event) {
								 		that.loadImage(event);
								 	}
									reader.readAsDataURL(f);
								}
								
								$("#" + uploadBtnId).change(function(event) {
										var $this = $(this), value = $(this).val();
										if (!value) return;
										parseImage(event);
										$this.val("");
								});
							},
							
							loadImage : function(event) {
									var that = this;
									var image = new Image();
									var data = event.target.result;
									this.image = image;
									image.src = data;
									image.onload = function() {
										that.draw(0, 0);
									}
									return this;
							},
							
							bindDragImageInCanvasEvent : function() {
								var $canvas = this.canvas, that = this,
										isDraw = false, currentX = currentY = 0;
										

								$canvas.mousedown(function(e) {
										currentX = e.originalEvent.x || e.originalEvent.layerX || 0; 
										currentY = e.originalEvent.y || e.originalEvent.layerY || 0; 
										isDraw = true;
										//$canvas.css("cursor", "crosshair");
								}).mouseup(function() {
									
										isDraw = false;
									//	$canvas.css("cursor", "auto");
										currentX = currentY = 0;
								}).mouseout(function() {
										isDraw = false;
									//	$canvas.css("cursor", "auto");
								}).mousemove(function(e) {
										if (!isDraw) return;
										var drawX = (e.originalEvent.x || e.originalEvent.layerX || 0) - currentX,
												drawY = (e.originalEvent.y || e.originalEvent.layerY || 0) - currentY;
												currentX = e.originalEvent.x || e.originalEvent.layerX || 0;
												currentY = e.originalEvent.y || e.originalEvent.layerY || 0; 
										that.moveX = that.moveX + drawX;
										that.moveY = that.moveY + drawY;
										that.draw(that.moveX, that.moveY);
								});
							},
							
							drawRect : function () {
								var ctx = this.ctx, config = this.config;
								ctx.beginPath(); 
								ctx.linewidth = 5;
								ctx.strokeStyle = "000";
								ctx.strokeRect(this.config.cropFrameX, this.config.cropFrameY, this.config.cropFrameWidth, this.config.cropFrameHeight);
							},
							
							draw : function(x, y) {
								var ctx = this.ctx, config = this.config;
								//clear
								ctx.clearRect(0, 0, config.width, config.height);
								//draw image
								ctx.drawImage(this.image, x, y, this.image.width, this.image.height);
								//draw rect
								this.drawRect();
							},
							
							fixCropImagePosition : function(image, cropRect) {
									var imageWidth = image.width, imageHeight = image.height,
											cropRectWidth = cropRect.width, cropRectHeight = cropRect.height,
											cropRectX = cropRect.x, cropRectY = cropRect.y;
											
									//check position
									var topleftCorner = {}, topRightCorner = {},
											bottomLeftCorner = {}, bottomLeftCorner = {};

									topleftCorner.x = cropRectX > 0 ? cropRectX  : 0;
									topleftCorner.y = cropRectY > 0 ? cropRectY  : 0;
									
									topRightCorner.x = cropRectX + cropRectWidth > imageWidth ? imageWidth : cropRectX + cropRectWidth;
									topRightCorner.y = cropRectY > 0 ? cropRectY : 0;
									
									bottomLeftCorner.x = cropRectX > 0 ? cropRectX : 0;
									bottomLeftCorner.y = cropRectY + cropRectHeight > imageHeight ? imageHeight : cropRectY + cropRectHeight;
									
								return {
										x : topleftCorner.x,
										y : topleftCorner.y,
										width : topRightCorner.x - topleftCorner.x,
										height : bottomLeftCorner.y - topleftCorner.y
									};
							},

							exportImageUrl : function() {
								var config = this.config, image = this.image;
								if (!image) return;
								var $tempCanvas = $("<canvas>").css({
									width : config.cropFrameWidth + "px",
									height : config.cropFrameHeight + "px"
								}).attr({
									width : config.cropFrameWidth,
									height : config.cropFrameHeight
								}).hide().appendTo(document.body);
							
								var ctx = $tempCanvas.get(0).getContext("2d");
								var cropRange = this.fixCropImagePosition(image, {
									x : config.cropFrameX - this.moveX,
									y : config.cropFrameY - this.moveY,
									width : config.cropFrameWidth,
									height : config.cropFrameHeight
								});
															ctx.drawImage(image, 
											cropRange.x, cropRange.y,
											cropRange.width, cropRange.height, 
											0, 0, cropRange.width, cropRange.height);
											
								var url = $tempCanvas.get(0).toDataURL("image/png");
								$tempCanvas.remove();
								return url;
							}
					}
					var cropImage = new CropImage($this, config);
					return cropImage;
			}