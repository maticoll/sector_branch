extends Node3D

func build_desert_outpost() -> void:
	var wall := _mat(Color("#3f463e"), 0.05, 0.82)
	var metal := _mat(Color("#53646a"), 0.38, 0.52)
	var dark_metal := _mat(Color("#151b1f"), 0.55, 0.48)
	var floor := _mat(Color("#746647"), 0.02, 0.88)
	var asphalt := _mat(Color("#202923"), 0.02, 0.9)
	var accent_a := _mat(Color("#f3b45d"), 0.08, 0.65)
	var accent_b := _mat(Color("#7dd9d2"), 0.1, 0.45)
	var glow_a := _emissive(Color("#f3b45d"), 0.9)
	var glow_b := _emissive(Color("#7dd9d2"), 0.9)

	_box("Floor", Vector3(0, -0.18, 0), Vector3(54, 0.35, 54), floor, true)
	_box("MainLane", Vector3(-7, 0.02, 0), Vector3(6.5, 0.04, 47), asphalt, false)
	_box("ServiceLane", Vector3(9, 0.025, 4), Vector3(5.5, 0.04, 37), asphalt, false)
	for z in [-20, -14, -8, -2, 4, 10, 16]:
		_box("LaneMark", Vector3(-7, 0.08, z), Vector3(0.14, 0.04, 2.1), accent_a, false)
		_box("LaneMarkBlue", Vector3(9, 0.08, z + 2), Vector3(0.12, 0.04, 1.5), accent_b, false)

	_box("NorthWall", Vector3(0, 2, -27), Vector3(54, 4, 0.8), wall, true)
	_box("SouthWall", Vector3(0, 2, 27), Vector3(54, 4, 0.8), wall, true)
	_box("WestWall", Vector3(-27, 2, 0), Vector3(0.8, 4, 54), wall, true)
	_box("EastWall", Vector3(27, 2, 0), Vector3(0.8, 4, 54), wall, true)

	for tower in [Vector3(-22, 2.6, -22), Vector3(22, 2.6, -22), Vector3(22, 2.6, 22), Vector3(-22, 2.6, 22)]:
		_box("CornerTower", tower, Vector3(2.4, 2.2, 2.4), metal, true)
		_box("TowerCap", tower + Vector3(0, 1.25, 0), Vector3(3.0, 0.14, 3.0), dark_metal, false)

	var covers := [
		[Vector3(-10, 1, -10), Vector3(8, 2, 1.5), wall],
		[Vector3(8, 1, -8), Vector3(2, 2, 8), metal],
		[Vector3(-13, 1, 3), Vector3(3, 2, 8), wall],
		[Vector3(3, 1, 6), Vector3(9, 2, 2), wall],
		[Vector3(14, 1, 11), Vector3(5, 2, 4), metal],
		[Vector3(-3, 1, 15), Vector3(6, 2, 2), wall],
		[Vector3(-18, 0.7, -2), Vector3(3, 1.4, 5), wall],
		[Vector3(17, 0.7, 0), Vector3(3, 1.4, 5), metal],
		[Vector3(-4, 2.4, 13), Vector3(7, 2.2, 2.7), metal]
	]
	for cover in covers:
		_box("Cover", cover[0], cover[1], cover[2], true)
		_trim(cover[0], cover[1], dark_metal)

	for crate in [Vector3(-18, 0, -15), Vector3(-12, 0, 14), Vector3(3, 0, -16), Vector3(17, 0, 16), Vector3(-4, 0, 10), Vector3(12, 0, 2)]:
		_crate_stack(crate, wall, metal)

	_pipe(Vector3(-7, 0.45, -1), dark_metal)
	_pipe(Vector3(7, 0.45, 3), dark_metal)
	_pipe(Vector3(0, 0.45, -17), dark_metal)

	_box("Catwalk", Vector3(0, 2.35, -18), Vector3(18, 0.24, 2.1), dark_metal, true)
	_box("CatwalkGlow", Vector3(0, 2.65, -18.95), Vector3(18, 0.1, 0.12), glow_b, false)

	_site("A", Vector3(9, 0.08, -10), accent_a, glow_a)
	_site("B", Vector3(13, 0.08, 9), accent_b, glow_b)

	for lamp in [[Vector3(-14, 0, -18), Color("#b6f45a")], [Vector3(14, 0, -18), Color("#f3b45d")], [Vector3(0, 0, 12), Color("#7dd9d2")], [Vector3(-18, 0, 8), Color("#9ab4ff")]]:
		_lamp(lamp[0], lamp[1], dark_metal)

func _site(label: String, position: Vector3, material: StandardMaterial3D, glow: StandardMaterial3D) -> void:
	_box("Site%sPad" % label, position, Vector3(4.2, 0.12, 4.2), material, false)
	_box("Site%sCore" % label, position + Vector3(0, 0.09, 0), Vector3(0.9, 0.1, 0.9), glow, false)
	_box("Site%sSign" % label, position + Vector3(0, 2.15, -2.0), Vector3(1.4, 0.75, 0.12), glow, false)
	_box("SignPostL", position + Vector3(-0.75, 1.05, -2.0), Vector3(0.08, 2.1, 0.08), material, false)
	_box("SignPostR", position + Vector3(0.75, 1.05, -2.0), Vector3(0.08, 2.1, 0.08), material, false)

func _crate_stack(base: Vector3, wall: StandardMaterial3D, metal: StandardMaterial3D) -> void:
	_box("Crate", base + Vector3(-0.65, 0.28, 0), Vector3(1.2, 0.56, 1.05), wall, true)
	_box("Crate", base + Vector3(0.55, 0.38, 0.55), Vector3(1.45, 0.75, 1.05), metal, true)
	_box("Crate", base + Vector3(0, 0.98, 0.28), Vector3(1.15, 0.9, 1.25), wall, true)

func _pipe(base: Vector3, material: StandardMaterial3D) -> void:
	_cylinder("Pipe", base, 0.13, 4.4, material, Vector3(0, 0, 90), true)
	_cylinder("PipeJoint", base + Vector3(2.1, 0, 0), 0.18, 0.5, material, Vector3.ZERO, true)
	_cylinder("PipeJoint", base + Vector3(-2.1, 0, 0), 0.18, 0.5, material, Vector3.ZERO, true)

func _lamp(base: Vector3, color: Color, material: StandardMaterial3D) -> void:
	_box("LightPole", base + Vector3(0, 1.7, 0), Vector3(0.12, 3.4, 0.12), material, false)
	_box("LampHead", base + Vector3(0, 3.35, 0), Vector3(0.75, 0.14, 0.45), _emissive(color, 1.2), false)
	var light := OmniLight3D.new()
	light.name = "LampLight"
	light.light_color = color
	light.light_energy = 1.25
	light.omni_range = 9.0
	light.position = base + Vector3(0, 3.2, 0)
	add_child(light)

func _trim(position: Vector3, size: Vector3, material: StandardMaterial3D) -> void:
	_box("TrimTop", position + Vector3(0, size.y * 0.52, 0), Vector3(size.x + 0.12, 0.08, size.z + 0.12), material, false)

func _box(name: String, position: Vector3, size: Vector3, material: StandardMaterial3D, collide: bool) -> MeshInstance3D:
	var mesh := MeshInstance3D.new()
	mesh.name = name
	mesh.mesh = BoxMesh.new()
	mesh.mesh.size = size
	mesh.material_override = material
	mesh.position = position
	mesh.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	add_child(mesh)
	if collide:
		var body := StaticBody3D.new()
		body.name = "%sBody" % name
		body.position = position
		var col := CollisionShape3D.new()
		var shape := BoxShape3D.new()
		shape.size = size
		col.shape = shape
		body.add_child(col)
		add_child(body)
	return mesh

func _cylinder(name: String, position: Vector3, radius: float, height: float, material: StandardMaterial3D, rotation_deg: Vector3, collide: bool) -> MeshInstance3D:
	var mesh := MeshInstance3D.new()
	mesh.name = name
	mesh.mesh = CylinderMesh.new()
	mesh.mesh.top_radius = radius
	mesh.mesh.bottom_radius = radius
	mesh.mesh.height = height
	mesh.mesh.radial_segments = 16
	mesh.material_override = material
	mesh.position = position
	mesh.rotation_degrees = rotation_deg
	add_child(mesh)
	if collide:
		_box("%sCollider" % name, position, Vector3(radius * 2.0, height, radius * 2.0), material, true).visible = false
	return mesh

static func _mat(color: Color, metallic: float, roughness: float) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.metallic = metallic
	mat.roughness = roughness
	return mat

static func _emissive(color: Color, strength: float) -> StandardMaterial3D:
	var mat := _mat(color, 0.1, 0.38)
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = strength
	return mat
