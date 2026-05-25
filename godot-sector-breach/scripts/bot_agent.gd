extends CharacterBody3D

var team := "defenders"
var target := Vector3.ZERO
var health := 100.0
var speed := 3.1
var gravity := ProjectSettings.get_setting("physics/3d/default_gravity") as float

var nav: NavigationAgent3D
var scan_timer := 0.0

func _ready() -> void:
	_build_body()
	nav = NavigationAgent3D.new()
	nav.path_desired_distance = 0.7
	nav.target_desired_distance = 1.2
	add_child(nav)
	nav.target_position = target

func _physics_process(delta: float) -> void:
	if health <= 0.0:
		return
	if not is_on_floor():
		velocity.y -= gravity * delta
	scan_timer -= delta
	if scan_timer <= 0.0:
		nav.target_position = target
		scan_timer = 0.25
	var next := nav.get_next_path_position()
	var flat := Vector3(next.x - global_position.x, 0.0, next.z - global_position.z)
	if flat.length() > 0.25:
		var dir := flat.normalized()
		velocity.x = dir.x * speed
		velocity.z = dir.z * speed
		look_at(global_position + dir, Vector3.UP)
	else:
		velocity.x = move_toward(velocity.x, 0.0, speed)
		velocity.z = move_toward(velocity.z, 0.0, speed)
	move_and_slide()

func take_damage(amount: float) -> void:
	health -= amount
	if health <= 0.0:
		queue_free()

func _build_body() -> void:
	var col := CollisionShape3D.new()
	var shape := CapsuleShape3D.new()
	shape.radius = 0.42
	shape.height = 1.25
	col.shape = shape
	col.position.y = 0.8
	add_child(col)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color("#4f7f7b") if team == "attackers" else Color("#7f4f4b")
	mat.metallic = 0.12
	mat.roughness = 0.68
	var torso := MeshInstance3D.new()
	torso.mesh = CapsuleMesh.new()
	torso.mesh.radius = 0.32
	torso.mesh.height = 1.25
	torso.position.y = 0.95
	torso.material_override = mat
	add_child(torso)
	var helmet := MeshInstance3D.new()
	helmet.mesh = SphereMesh.new()
	helmet.mesh.radius = 0.24
	helmet.position.y = 1.65
	helmet.material_override = mat
	add_child(helmet)
	var rifle := MeshInstance3D.new()
	rifle.mesh = BoxMesh.new()
	rifle.mesh.size = Vector3(0.16, 0.12, 0.72)
	rifle.position = Vector3(0.32, 1.1, -0.32)
	rifle.material_override = mat
	add_child(rifle)
