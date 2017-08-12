import json
import urllib2
import urllib

LIST_HERO_URL = "http://api.steampowered.com/IEconDOTA2_570/GetHeroes/v1?key=AC75E8715CB885092A67F97878B9F13B"

def getJsonObj(url):
    f = urllib2.urlopen(url)
    return json.load(f)

heroes_res = getJsonObj(LIST_HERO_URL)

hero_list = heroes_res['result']['heroes']

for hero in hero_list:
    hero_name = hero['name'].replace('npc_dota_hero_', '')
    hero_id = hero['id']
    print hero_name
    urllib.urlretrieve('http://cdn.dota2.com/apps/dota2/images/heroes/' + hero_name + '_sb.png', 'images/heroes/' + str(hero_id) + '.png');
