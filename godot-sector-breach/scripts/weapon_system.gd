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
	var weapon: Dictionary = weapons[active_slot]
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
	var weapon: Dictionary = weapons[active_slot]
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
	var weapon: Dictionary = weapons[active_slot]
	weapon_mesh = Node3D.new()
	weapon_mesh.position = Vector3(0.42, -0.36, -0.92)
	weapon_mesh.rotation_degrees = Vector3(-2, -4, 0)
	add_child(weapon_mesh)
	var long := active_slot == 1
	_part_box("Receiver", Vector3(0, 0.02, -0.1), Vector3(0.18, 0.12, 0.64 if long else 0.34), _skin_material(weapon["skin"]))
	_part_box("Stock", Vector3(0, 0.01, 0.28 if long else 0.12), Vector3(0.16, 0.11, 0.22), _metal_material(Color("#202827")))
	_part_box("TopRail", Vector3(0, 0.11, -0.1), Vector3(0.14, 0.035, 0.58 if long else 0.28), _metal_material(Color("#090c0d")))
	_part_box("Grip", Vector3(0.015, -0.17, 0.08), Vector3(0.105, 0.28, 0.11), _metal_material(Color("#080b0c")), Vector3(-13, 0, 0))
	_part_box("Magazine", Vector3(0, -0.16, -0.14), Vector3(0.12, 0.27 if long else 0.18, 0.12), _metal_material(Color("#111617")), Vector3(5, 0, 0))
	_part_cylinder("Barrel", Vector3(0, 0.035, -0.47 if long else -0.29), 0.024, 0.44 if long else 0.26, _metal_material(Color("#0d1112")), Vector3(90, 0, 0))
	if long:
		_part_cylinder("Muzzle", Vector3(0, 0.035, -0.72), 0.032, 0.16, _metal_material(Color("#060808")), Vector3(90, 0, 0))
		_part_cylinder("Optic", Vector3(0, 0.19, -0.16), 0.055, 0.2, _metal_material(Color("#111617")), Vector3(0, 0, 90))
	else:
		_part_box("FrontSight", Vector3(0, 0.15, -0.25), Vector3(0.04, 0.045, 0.035), _metal_material(Color("#0a0d0e")))

func _part_box(name: String, position: Vector3, size: Vector3, material: StandardMaterial3D, rotation := Vector3.ZERO) -> MeshInstance3D:
	var mesh := MeshInstance3D.new()
	mesh.name = name
	mesh.mesh = BoxMesh.new()
	mesh.mesh.size = size
	mesh.position = position
	mesh.rotation_degrees = rotation
	mesh.material_override = material
	mesh.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	weapon_mesh.add_child(mesh)
	return mesh

func _part_cylinder(name: String, position: Vector3, radius: float, height: float, material: StandardMaterial3D, rotation := Vector3.ZERO) -> MeshInstance3D:
	var mesh := MeshInstance3D.new()
	mesh.name = name
	mesh.mesh = CylinderMesh.new()
	mesh.mesh.top_radius = radius
	mesh.mesh.bottom_radius = radius
	mesh.mesh.height = height
	mesh.mesh.radial_segments = 18
	mesh.position = position
	mesh.rotation_degrees = rotation
	mesh.material_override = material
	mesh.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	weapon_mesh.add_child(mesh)
	return mesh

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
