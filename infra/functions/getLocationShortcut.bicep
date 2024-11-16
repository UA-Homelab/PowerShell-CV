@export()
func getLocationShortcut(locationValue string) string => loadYamlContent('../lib/locations.yaml')[locationValue]
