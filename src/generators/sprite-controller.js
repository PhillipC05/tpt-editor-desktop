/**
 * Sprite Controller - Runtime sprite movement system
 * Handles position, rotation, scale management with collision detection and physics
 */

class SpriteController {
    constructor(options = {}) {
        // Sprite properties
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.scale = { x: 1, y: 1 };
        this.opacity = 1.0;

        // Sprite metadata
        this.spriteId = options.spriteId || 'sprite_' + Math.random().toString(36).substr(2, 9);
        this.spriteName = options.spriteName || 'Unnamed Sprite';
        this.spriteData = options.spriteData || null;
        this.animationData = options.animationData || null;

        // Animation state
        this.currentAnimation = options.defaultAnimation || 'idle';
        this.animationFrame = 0;
        this.animationTime = 0;
        this.animationSpeed = 1.0;
        this.isAnimating = true;
        this.loopAnimation = true;

        // Physics properties
        this.mass = options.mass || 1.0;
        this.friction = options.friction || 0.9;
        this.bounce = options.bounce || 0.3;
        this.gravity = options.gravity || 0.0;
        this.maxVelocity = options.maxVelocity || { x: 10, y: 10 };

        // Collision properties
        this.collisionEnabled = options.collisionEnabled !== false;
        this.collisionBounds = options.collisionBounds || null; // Will be calculated from sprite
        this.collisionLayer = options.collisionLayer || 'default';
        this.collisionMask = options.collisionMask || ['default'];

        // Movement properties
        this.movementType = options.movementType || 'free'; // free, grid, path, physics
        this.movementSpeed = options.movementSpeed || 1.0;
        this.targetPosition = null;
        this.path = [];
        this.pathIndex = 0;

        // State flags
        this.isActive = true;
        this.isVisible = true;
        this.isGrounded = false;
        this.isMoving = false;
        this.facingDirection = 'south'; // north, south, east, west, etc.

        // Callback functions
        this.onPositionChanged = options.onPositionChanged || null;
        this.onAnimationChanged = options.onAnimationChanged || null;
        this.onCollision = options.onCollision || null;
        this.onMovementComplete = options.onMovementComplete || null;

        // Internal state
        this.lastPosition = { ...this.position };
        this.deltaTime = 0;
        this.lastUpdateTime = Date.now();

        // Initialize collision bounds
        this.updateCollisionBounds();
    }

    /**
     * Update sprite state
     */
    update(deltaTime = null) {
        if (!this.isActive) return;

        // Calculate delta time
        if (deltaTime === null) {
            const currentTime = Date.now();
            this.deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
            this.lastUpdateTime = currentTime;
        } else {
            this.deltaTime = deltaTime;
        }

        // Limit delta time to prevent large jumps
        this.deltaTime = Math.min(this.deltaTime, 1/30); // Max 30 FPS equivalent

        // Store last position for collision detection
        this.lastPosition = { ...this.position };

        // Update physics
        this.updatePhysics();

        // Update movement
        this.updateMovement();

        // Update animation
        this.updateAnimation();

        // Update rotation
        this.updateRotation();

        // Update scale (if animated)
        this.updateScale();

        // Check collisions
        if (this.collisionEnabled) {
            this.checkCollisions();
        }

        // Check if position changed
        if (this.position.x !== this.lastPosition.x || this.position.y !== this.lastPosition.y) {
            this.isMoving = true;
            if (this.onPositionChanged) {
                this.onPositionChanged(this.position, this.lastPosition);
            }
        } else {
            this.isMoving = false;
        }

        // Update facing direction based on movement
        this.updateFacingDirection();
    }

    /**
     * Update physics simulation
     */
    updatePhysics() {
        // Apply gravity
        if (this.gravity !== 0) {
            this.acceleration.y += this.gravity;
        }

        // Apply acceleration to velocity
        this.velocity.x += this.acceleration.x * this.deltaTime;
        this.velocity.y += this.acceleration.y * this.deltaTime;

        // Limit velocity
        this.velocity.x = Math.max(-this.maxVelocity.x, Math.min(this.maxVelocity.x, this.velocity.x));
        this.velocity.y = Math.max(-this.maxVelocity.y, Math.min(this.maxVelocity.y, this.velocity.y));

        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;

        // Apply velocity to position
        this.position.x += this.velocity.x * this.deltaTime * 60; // Assuming 60 FPS base
        this.position.y += this.velocity.y * this.deltaTime * 60;

        // Reset acceleration
        this.acceleration.x = 0;
        this.acceleration.y = 0;
    }

    /**
     * Update movement based on movement type
     */
    updateMovement() {
        switch (this.movementType) {
            case 'free':
                // Free movement - already handled by physics
                break;

            case 'grid':
                this.updateGridMovement();
                break;

            case 'path':
                this.updatePathMovement();
                break;

            case 'physics':
                // Physics movement - already handled
                break;

            default:
                break;
        }
    }

    /**
     * Update grid-based movement
     */
    updateGridMovement() {
        const gridSize = 32; // Assume 32x32 pixel grid

        if (this.targetPosition) {
            const dx = this.targetPosition.x - this.position.x;
            const dy = this.targetPosition.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > gridSize / 2) {
                // Move towards target
                const moveSpeed = this.movementSpeed * gridSize;
                const moveX = (dx / distance) * moveSpeed * this.deltaTime;
                const moveY = (dy / distance) * moveSpeed * this.deltaTime;

                this.position.x += moveX;
                this.position.y += moveY;
            } else {
                // Snap to grid position
                this.position.x = Math.round(this.targetPosition.x / gridSize) * gridSize;
                this.position.y = Math.round(this.targetPosition.y / gridSize) * gridSize;
                this.targetPosition = null;

                if (this.onMovementComplete) {
                    this.onMovementComplete();
                }
            }
        }
    }

    /**
     * Update path-based movement
     */
    updatePathMovement() {
        if (this.path.length > 0 && this.pathIndex < this.path.length) {
            const targetNode = this.path[this.pathIndex];
            const dx = targetNode.x - this.position.x;
            const dy = targetNode.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 5) { // Close enough threshold
                // Move towards target node
                const moveSpeed = this.movementSpeed * 100; // pixels per second
                const moveX = (dx / distance) * moveSpeed * this.deltaTime;
                const moveY = (dy / distance) * moveSpeed * this.deltaTime;

                this.position.x += moveX;
                this.position.y += moveY;
            } else {
                // Move to next node
                this.pathIndex++;
                if (this.pathIndex >= this.path.length) {
                    this.path = [];
                    this.pathIndex = 0;
                    if (this.onMovementComplete) {
                        this.onMovementComplete();
                    }
                }
            }
        }
    }

    /**
     * Update animation state
     */
    updateAnimation() {
        if (!this.animationData || !this.isAnimating) return;

        const currentAnim = this.animationData[this.currentAnimation];
        if (!currentAnim) return;

        // Update animation time
        this.animationTime += this.deltaTime * 1000 * this.animationSpeed; // Convert to milliseconds

        // Calculate current frame
        const frameDuration = currentAnim.frameDuration || (currentAnim.duration / currentAnim.frames.length);
        const totalFrames = currentAnim.frames.length;

        if (this.loopAnimation || this.animationTime < currentAnim.duration) {
            this.animationFrame = Math.floor((this.animationTime % currentAnim.duration) / frameDuration);
        } else {
            this.animationFrame = Math.min(totalFrames - 1, Math.floor(this.animationTime / frameDuration));
        }

        // Handle animation completion
        if (!this.loopAnimation && this.animationTime >= currentAnim.duration) {
            this.isAnimating = false;
            this.animationTime = currentAnim.duration;
        }
    }

    /**
     * Update rotation
     */
    updateRotation() {
        if (this.rotationSpeed !== 0) {
            this.rotation += this.rotationSpeed * this.deltaTime;
            // Normalize rotation to 0-360 degrees
            this.rotation = ((this.rotation % 360) + 360) % 360;
        }
    }

    /**
     * Update scale (for scaling animations)
     */
    updateScale() {
        // Scale animation would be implemented here
        // For now, scale remains static
    }

    /**
     * Update facing direction based on movement
     */
    updateFacingDirection() {
        if (!this.isMoving) return;

        const dx = this.position.x - this.lastPosition.x;
        const dy = this.position.y - this.lastPosition.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal movement
            this.facingDirection = dx > 0 ? 'east' : 'west';
        } else {
            // Vertical movement
            this.facingDirection = dy > 0 ? 'south' : 'north';
        }
    }

    /**
     * Check for collisions
     */
    checkCollisions() {
        // This would integrate with a collision system
        // For now, implement basic boundary checking
        this.checkBoundaryCollisions();
    }

    /**
     * Check boundary collisions
     */
    checkBoundaryCollisions() {
        // Assume world boundaries
        const worldBounds = {
            left: 0,
            top: 0,
            right: 800, // Would be configurable
            bottom: 600
        };

        const bounds = this.collisionBounds;
        if (!bounds) return;

        // Check left boundary
        if (bounds.left < worldBounds.left) {
            this.position.x = worldBounds.left + bounds.width / 2;
            this.velocity.x = Math.abs(this.velocity.x) * this.bounce;
            this.handleCollision('left');
        }

        // Check right boundary
        if (bounds.right > worldBounds.right) {
            this.position.x = worldBounds.right - bounds.width / 2;
            this.velocity.x = -Math.abs(this.velocity.x) * this.bounce;
            this.handleCollision('right');
        }

        // Check top boundary
        if (bounds.top < worldBounds.top) {
            this.position.y = worldBounds.top + bounds.height / 2;
            this.velocity.y = Math.abs(this.velocity.y) * this.bounce;
            this.handleCollision('top');
        }

        // Check bottom boundary
        if (bounds.bottom > worldBounds.bottom) {
            this.position.y = worldBounds.bottom - bounds.height / 2;
            this.velocity.y = -Math.abs(this.velocity.y) * this.bounce;
            this.isGrounded = true;
            this.handleCollision('bottom');
        } else {
            this.isGrounded = false;
        }
    }

    /**
     * Handle collision event
     */
    handleCollision(direction) {
        if (this.onCollision) {
            this.onCollision(direction, this);
        }
    }

    /**
     * Update collision bounds
     */
    updateCollisionBounds() {
        if (!this.spriteData) {
            // Default collision bounds
            this.collisionBounds = {
                left: this.position.x - 16,
                top: this.position.y - 16,
                right: this.position.x + 16,
                bottom: this.position.y + 16,
                width: 32,
                height: 32
            };
            return;
        }

        // Calculate bounds based on sprite data
        const frame = this.spriteData.frames[this.getCurrentFrameId()];
        if (frame) {
            const halfWidth = frame.frame.w / 2;
            const halfHeight = frame.frame.h / 2;

            this.collisionBounds = {
                left: this.position.x - halfWidth,
                top: this.position.y - halfHeight,
                right: this.position.x + halfWidth,
                bottom: this.position.y + halfHeight,
                width: frame.frame.w,
                height: frame.frame.h
            };
        }
    }

    /**
     * Get current frame ID for animation
     */
    getCurrentFrameId() {
        if (!this.animationData || !this.animationData[this.currentAnimation]) {
            return null;
        }

        const currentAnim = this.animationData[this.currentAnimation];
        if (this.animationFrame < currentAnim.frames.length) {
            return currentAnim.frames[this.animationFrame];
        }

        return null;
    }

    /**
     * Set sprite position
     */
    setPosition(x, y) {
        this.lastPosition = { ...this.position };
        this.position.x = x;
        this.position.y = y;
        this.updateCollisionBounds();

        if (this.onPositionChanged) {
            this.onPositionChanged(this.position, this.lastPosition);
        }
    }

    /**
     * Move sprite by offset
     */
    move(offsetX, offsetY) {
        this.setPosition(this.position.x + offsetX, this.position.y + offsetY);
    }

    /**
     * Set sprite velocity
     */
    setVelocity(velocityX, velocityY) {
        this.velocity.x = velocityX;
        this.velocity.y = velocityY;
    }

    /**
     * Add force to sprite
     */
    addForce(forceX, forceY) {
        this.acceleration.x += forceX / this.mass;
        this.acceleration.y += forceY / this.mass;
    }

    /**
     * Set target position for movement
     */
    setTargetPosition(x, y) {
        this.targetPosition = { x, y };
    }

    /**
     * Set movement path
     */
    setPath(path) {
        this.path = path;
        this.pathIndex = 0;
    }

    /**
     * Set current animation
     */
    setAnimation(animationName, loop = true) {
        if (this.animationData && this.animationData[animationName]) {
            this.currentAnimation = animationName;
            this.animationFrame = 0;
            this.animationTime = 0;
            this.loopAnimation = loop;
            this.isAnimating = true;

            if (this.onAnimationChanged) {
                this.onAnimationChanged(animationName);
            }
        }
    }

    /**
     * Set sprite rotation
     */
    setRotation(angle) {
        this.rotation = angle;
    }

    /**
     * Set sprite scale
     */
    setScale(scaleX, scaleY = scaleX) {
        this.scale.x = scaleX;
        this.scale.y = scaleY;
    }

    /**
     * Set sprite opacity
     */
    setOpacity(opacity) {
        this.opacity = Math.max(0, Math.min(1, opacity));
    }

    /**
     * Get sprite bounds
     */
    getBounds() {
        return this.collisionBounds;
    }

    /**
     * Check if sprite collides with another sprite
     */
    collidesWith(otherSprite) {
        if (!this.collisionBounds || !otherSprite.collisionBounds) {
            return false;
        }

        const a = this.collisionBounds;
        const b = otherSprite.collisionBounds;

        return !(a.left > b.right ||
                 a.right < b.left ||
                 a.top > b.bottom ||
                 a.bottom < b.top);
    }

    /**
     * Get distance to another sprite
     */
    distanceTo(otherSprite) {
        const dx = this.position.x - otherSprite.position.x;
        const dy = this.position.y - otherSprite.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get direction to another sprite
     */
    directionTo(otherSprite) {
        const dx = otherSprite.position.x - this.position.x;
        const dy = otherSprite.position.y - this.position.y;
        return Math.atan2(dy, dx);
    }

    /**
     * Look at another sprite
     */
    lookAt(otherSprite) {
        const angle = this.directionTo(otherSprite) * 180 / Math.PI;
        this.setRotation(angle);
    }

    /**
     * Get sprite state for serialization
     */
    getState() {
        return {
            spriteId: this.spriteId,
            position: { ...this.position },
            velocity: { ...this.velocity },
            rotation: this.rotation,
            scale: { ...this.scale },
            opacity: this.opacity,
            currentAnimation: this.currentAnimation,
            animationFrame: this.animationFrame,
            isActive: this.isActive,
            isVisible: this.isVisible,
            facingDirection: this.facingDirection
        };
    }

    /**
     * Set sprite state from serialized data
     */
    setState(state) {
        this.spriteId = state.spriteId;
        this.position = { ...state.position };
        this.velocity = { ...state.velocity };
        this.rotation = state.rotation;
        this.scale = { ...state.scale };
        this.opacity = state.opacity;
        this.currentAnimation = state.currentAnimation;
        this.animationFrame = state.animationFrame;
        this.isActive = state.isActive;
        this.isVisible = state.isVisible;
        this.facingDirection = state.facingDirection;

        this.updateCollisionBounds();
    }

    /**
     * Destroy sprite
     */
    destroy() {
        this.isActive = false;
        this.isVisible = false;
        // Clean up any resources
    }
}

module.exports = SpriteController;
