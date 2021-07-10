import json

file = open('test_data.json', "r", encoding='UTF-8')
data = json.loads(file.read())


#print first item in the list of licenses
#print(data['Licenses'][0])

# Access License No. for the first Item
#print(data['Licenses'][0]['Serial'])

# Access License Data as per License ID
# data json file considered as dict type

for id in data:                      # Accessing dict of Licenses ==> key = Licenses , value = Licenses Data list
    extracted_data = (data[id])      # Saving Dictionary values inside the array of Licenses in extracted_data variable
    for item in extracted_data:
        dict_items = item.items()
        for item in dict_items:
            print(item, item[dict_items])
            
    '''
    for data[id] in id:      # Looping in the known 2 values inside this list
        print(data[id])           # Looping in the dict for the first list

    '''