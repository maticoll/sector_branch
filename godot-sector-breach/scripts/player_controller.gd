extends CharacterBody3D

const WeaponSystem = preload("res://scripts/weapon_system.gd")

var speed := 6.0
var jump_velocity := 5.0
var mouse_sensitivity := 0.0022
var gravity := ProjectSettings.get_setting("physics/3d/default_gravity") as float
var yaw := 0.0
var pitch := 0.0

var head: Node3D
var camera: Camera3D
var weapon_system: Node3D

func _ready() -> void:
	_build_collision()
	_build_camera()
	weapon_system = WeaponSystem.new()
	camera.add_child(weapon_system)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		yaw -= event.relative.x * mouse_sensitivity
		pitch = clamp(pitch - event.relative.y * mouse_sensitivity, -1.35, 1.35)
		rotation.y = yaw
		head.rotation.x = pitch
	if event.is_action_pressed("fire"):
		weapon_system.fire(camera)
	if event.is_action_pressed("reload"):
		weapon_system.reload()
	if event.is_action_pressed("weapon_1"):
		weapon_system.switch_slot(0)
	if event.is_action_pressed("weapon_2"):
		weapon_system.switch_slot(1)

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y -= gravity * delta
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = jump_velocity
	var input_dir := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var direction := (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()
	if direction:
		velocity.x = direction.x * speed
		velocity.z = direction.z * speed
	else:
		velocity.x = move_toward(velocity.x, 0.0, speed)
		velocity.z = move_toward(velocity.z, 0.0, speed)
	move_and_slide()

func _build_collision() -> void:
	var shape := CapsuleShape3D.new()
	shape.radius = 0.42
	shape.height = 1.4
	var col := CollisionShape3D.new()
	col.shape = shape
	col.position.y = 0.7
	add_child(col)

func _build_camera() -> void:
	head = Node3D.new()
	head.name = "Head"
	head.position.y = 1.55
	add_child(head)
	camera = Camera3D.new()
	camera.name = "Camera"
	camera.fov = 74.0
	head.add_child(camera)
