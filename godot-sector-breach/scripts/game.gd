extends Node3D

const PlayerController = preload("res://scripts/player_controller.gd")
const BotAgent = preload("res://scripts/bot_agent.gd")
const MapBuilder = preload("res://scripts/map_builder.gd")

@onready var status_label: Label = $Hud/Status

var map_builder: Node3D
var player: CharacterBody3D
var bots: Array[CharacterBody3D] = []
var round_time := 120.0
var buy_time := 8.0
var phase := "BUY"

func _ready() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	_build_level()
	_spawn_player()
	_spawn_bots()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	if event is InputEventMouseButton and event.pressed:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _process(delta: float) -> void:
	if phase == "BUY":
		buy_time -= delta
		if buy_time <= 0.0:
			phase = "LIVE"
	elif phase == "LIVE":
		round_time -= delta
	status_label.text = "Sector Breach Godot | %s | %.0fs | Bots %d | 1/2 cambia arma | R recarga" % [phase, max(round_time if phase == "LIVE" else buy_time, 0.0), bots.size()]

func _build_level() -> void:
	map_builder = MapBuilder.new()
	map_builder.name = "BlockoutMap"
	add_child(map_builder)
	map_builder.build_desert_outpost()

func _spawn_player() -> void:
	player = PlayerController.new()
	player.name = "Player"
	add_child(player)
	player.global_position = Vector3(-18, 1.4, -15)

func _spawn_bots() -> void:
	var attacker_points := [Vector3(-14, 0.2, -13), Vector3(-16, 0.2, -10), Vector3(-12, 0.2, -16)]
	var defender_points := [Vector3(13, 0.2, 8), Vector3(16, 0.2, 12), Vector3(9, 0.2, -10), Vector3(15, 0.2, -7)]
	for point in attacker_points:
		_spawn_bot(point, true)
	for point in defender_points:
		_spawn_bot(point, false)

func _spawn_bot(point: Vector3, ally: bool) -> void:
	var bot := BotAgent.new()
	bot.name = "Ally" if ally else "Enemy"
	bot.team = "attackers" if ally else "defenders"
	bot.target = Vector3(9, 0, -10) if ally else Vector3(-18, 0, -15)
	add_child(bot)
	bot.global_position = point
	bots.append(bot)
