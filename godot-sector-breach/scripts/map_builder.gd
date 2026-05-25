extends Node3D

func build_desert_outpost() -> void:
	var wall_material := _mat(Color("#3f463e"), 0.05, 0.82)
	var metal_material := _mat(Color("#53646a"), 0.38, 0.52)
	var floor_material := _mat(Color("#746647"), 0.02, 0.88)
	var accent_a := _mat(Color("#f3b45d"), 0.08, 0.65)
	var accent_b := _mat(Color("#7dd9d2"), 0.1, 0.45)
	_box("Floor", Vector3.ZERO, Vector3(54, 0.35, 54), floor_material, true)
	_box("NorthWall", Vector3(0, 2, -27), Vector3(54, 4, 0.8), wall_material, true)
	_box("SouthWall", Vector3(0, 2, 27), Vector3(54, 4, 0.8), wall_material, true)
	_box("WestWall", Vector3(-27, 2, 0), Vector3(0.8, 4, 54), wall_material, true)
	_box("EastWall", Vector3(27, 2, 0), Vector3(0.8, 4, 54), wall_material, true)
	var covers := [
		[Vector3(-10, 1, -10), Vector3(8, 2, 1.5)],
		[Vector3(8, 1, -8), Vector3(2, 2, 8)],
		[Vector3(-13, 1, 3), Vector3(3, 2, 8)],
		[Vector3(3, 1, 6), Vector3(9, 2, 2)],
		[Vector3(14, 1, 11), Vector3(5, 2, 4)],
		[Vector3(-3, 1, 15), Vector3(6, 2, 2)],
		[Vector3(-18, 0.7, -2), Vector3(3, 1.4, 5)],
		[Vector3(17, 0.7, 0), Vector3(3, 1.4, 5)]
	]
	for cover in covers:
		_box("Cover", cover[0], cover[1], wall_material if randf() > 0.45 else metal_material, true)
	_site("A", Vector3(9, 0.08, -10), accent_a)
	_site("B", Vector3(13, 0.08, 9), accent_b)

func _site(label: String, position: Vector3, material: StandardMaterial3D) -> void:
	_box("Site%s" % label, position, Vector3(4.2, 0.12, 4.2), material, false)
	_box("Site%sSign" % label, position + Vector3(0, 2.0, -2.0), Vector3(1.2, 0.7, 0.12), material, false)

func _box(name: String, position: Vector3, size: Vector3, material: StandardMaterial3D, collide: bool) -> void:
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

static func _mat(color: Color, metallic: float, roughness: float) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.metallic = metallic
	mat.roughness = roughness
	return mat
