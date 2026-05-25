extends Node3D

var weapons := [
	{"name": "P-9 Sandline", "mag": 12, "ammo": 12, "reserve": 48, "damage": 28.0, "delay": 0.32, "skin": Color("#d96f42")},
	{"name": "R-47 Boreal", "mag": 30, "ammo": 30, "reserve": 90, "damage": 34.0, "delay": 0.11, "skin": Color("#19a7a1")}
]

var active_slot := 0
var cooldown := 0.0
var reloading := false
var weapon_mesh: Node3D

func _ready() -> void:
	_build_viewmodel()

func _process(delta: float) -> void:
	cooldown = max(cooldown - delta, 0.0)

func switch_slot(slot: int) -> void:
	if slot < 0 or slot >= weapons.size():
		return
	active_slot = slot
	reloading = false
	_build_viewmodel()

func fire(camera: Camera3D) -> void:
	var weapon := weapons[active_slot]
	if cooldown > 0.0 or reloading:
		return
	if weapon["ammo"] <= 0:
		reload()
		return
	weapon["ammo"] -= 1
	weapons[active_slot] = weapon
	cooldown = weapon["delay"]
	var space := camera.get_world_3d().direct_space_state
	var origin := camera.global_position
	var end := origin + -camera.global_transform.basis.z * 90.0
	var query := PhysicsRayQueryParameters3D.create(origin, end)
	var hit := space.intersect_ray(query)
	if hit and hit.has("collider") and hit["collider"].has_method("take_damage"):
		hit["collider"].take_damage(weapon["damage"])

func reload() -> void:
	var weapon := weapons[active_slot]
	if weapon["ammo"] >= weapon["mag"] or weapon["reserve"] <= 0:
		return
	var needed: int = weapon["mag"] - weapon["ammo"]
	var loaded: int = mini(needed, weapon["reserve"])
	weapon["ammo"] += loaded
	weapon["reserve"] -= loaded
	weapons[active_slot] = weapon

func _build_viewmodel() -> void:
	if weapon_mesh:
		weapon_mesh.queue_free()
	var weapon := weapons[active_slot]
	weapon_mesh = Node3D.new()
	weapon_mesh.position = Vector3(0.35, -0.28, -0.75)
	add_child(weapon_mesh)
	var body := MeshInstance3D.new()
	body.mesh = BoxMesh.new()
	body.mesh.size = Vector3(0.22, 0.16, 0.75 if active_slot == 1 else 0.42)
	body.material_override = _skin_material(weapon["skin"])
	weapon_mesh.add_child(body)
	var barrel := MeshInstance3D.new()
	barrel.mesh = CylinderMesh.new()
	barrel.mesh.top_radius = 0.035
	barrel.mesh.bottom_radius = 0.035
	barrel.mesh.height = 0.55 if active_slot == 1 else 0.32
	barrel.rotation_degrees.x = 90
	barrel.position.z = -0.42
	barrel.material_override = _metal_material()
	weapon_mesh.add_child(barrel)
	var grip := MeshInstance3D.new()
	grip.mesh = BoxMesh.new()
	grip.mesh.size = Vector3(0.13, 0.34, 0.15)
	grip.position = Vector3(0.02, -0.23, 0.1)
	grip.rotation_degrees.x = -12
	grip.material_override = _metal_material(Color("#0a0d0e"))
	weapon_mesh.add_child(grip)

func _skin_material(color: Color) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.metallic = 0.55
	mat.roughness = 0.38
	return mat

func _metal_material(color := Color("#14191b")) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.metallic = 0.8
	mat.roughness = 0.32
	return mat
