// const fs = require('fs');
// var logger = require('winston');
const axios = require('axios');
const Discord = require('discord.js');

const client = new Discord.Client();

const limitlessChannelID = '690948810490249217';
const onlinemsgID = '692773217085161542';
const guild = 'Limitless'; //guild to watch
const refreshtime = 5 * 60; //interval to refresh data in seconds

function getMembers() {

    //create embed message
    const embedMsg = {
        color: 0x0099ff,
        title: guild,
        timestamp: new Date(),
        footer: {
            text: 'Last updated',
        },
    };
    //get info about guild
    axios.get('https://api.tibiadata.com/v2/guild/' + guild + '.json', {})
        .then(response => {
            let knights = [], druids = [], palas = [], sorcs = [], vices = [];
            let onlinecount = 0;
            try {
                for (i = 0; i < response.data.guild.members.length; i++) {
                    for (j = 0; j < response.data.guild.members[i].characters.length; j++) {
                        let tbltmp = [];
                        if (response.data.guild.members[i].characters[j].status == "online") {
                            let voc = response.data.guild.members[i].characters[j].vocation;
                            let prof = "";

                            tbltmp.push(response.data.guild.members[i].characters[j].name);
                            tbltmp.push(response.data.guild.members[i].characters[j].level);
                            // tbltmp.push(response.data.guild.members[i].characters[j].vocation);

                            if (response.data.guild.members[i].rank_title === 'Leader' || response.data.guild.members[i].rank_title === 'Vice President'
                                || response.data.guild.members[i].characters[j].name == 'Shayall' || response.data.guild.members[i].characters[j].name == 'Heir Kaan') {
                                vices.push(tbltmp);
                            }

                            if (voc == "Knight" || voc == "Elite Knight") {
                                prof = ":shield:";
                                tbltmp.push(prof);
                                knights.push(tbltmp);
                            }
                            if (voc == "Druid" || voc == "Elder Druid") {
                                prof = ":snowflake:";
                                tbltmp.push(prof);
                                druids.push(tbltmp);
                            }
                            if (voc == "Paladin" || voc == "Royal Paladin") {
                                prof = ":bow_and_arrow:";
                                tbltmp.push(prof);
                                palas.push(tbltmp);
                            }
                            if (voc == "Sorcerer" || voc == "Master Sorcerer") {
                                prof = ":fire:";
                                tbltmp.push(prof);
                                sorcs.push(tbltmp);
                            }

                            onlinecount += 1;
                        }
                    }
                }
            }
            catch (error) {
                console.error(error);
                client.channels.fetch(limitlessChannelID)
                    .then(channel => {
                        channel.setName(guild + "-x");
                        embedMsg.description = 'Error retrieving data.';
                        embedMsg.fields = null;
                        channel.messages.fetch(onlinemsgID)
                            .then(message => message.edit({ embed: embedMsg }))
                            .catch(console.error)
                    })
                    .catch(console.error);
            }

            //sort all lists
            let srtKnights = knights.sort((a, b) => b[1] - a[1]);
            let srtDruids = druids.sort((a, b) => b[1] - a[1]);
            let srtPalas = palas.sort((a, b) => b[1] - a[1]);
            let srtSorcs = sorcs.sort((a, b) => b[1] - a[1]);

            //make tables for vocations
            let knightnames = [], knightlevels = [];
            for (i = 0; i < srtKnights.length; i++) {
                knightnames.push(srtKnights[i][0]);
                knightlevels.push(srtKnights[i][1]);
            }

            let druidnames = [], druidlevels = [];
            for (i = 0; i < srtDruids.length; i++) {
                druidnames.push(srtDruids[i][0]);
                druidlevels.push(srtDruids[i][1]);
            }

            let palanames = [], palalevels = [];
            for (i = 0; i < srtPalas.length; i++) {
                palanames.push(srtPalas[i][0]);
                palalevels.push(srtPalas[i][1]);
            }

            let sorcnames = [], sorclevels = [];
            for (i = 0; i < srtSorcs.length; i++) {
                sorcnames.push(srtSorcs[i][0]);
                sorclevels.push(srtSorcs[i][1]);
            }

            let vicenames = [], vicelevels = [];
            for (i = 0; i < vices.length; i++) {
                vicenames.push(vices[i][0]);
                vicelevels.push(vices[i][1]);
            }


            let vicestxt = ":crown: **(Vice-)Leaders**";
            let knighttxt = "\n:shield: **Knights** ";
            let druidtxt = "\n:snowflake: **Druids** ";
            let palatxt = "\n:bow_and_arrow: **Paladins** ";
            let sorctxt = "\n:fire: **Sorcerers** ";

            let vicessymbol = ":crown:";
            let knightsymbol = "\n:shield:";
            let druidsymbol = "\n:snowflake:";
            let palasymbol = "\n:bow_and_arrow:";
            let sorcsymbol = "\n:fire:";

            if (vices.length == 0) { vicestxt = ":crown: No (Vice-)Leaders online."; }
            if (knights.length == 0) { knighttxt = []; knightsymbol = []; }
            if (druids.length == 0) { druidtxt = []; druidsymbol = []; }
            if (palas.length == 0) { palatxt = []; palasymbol = []; }
            if (sorcs.length == 0) { sorctxt = []; sorcsymbol = []; }

            //create lists of names and levels
            let nameslist = [], levelslist = [];
            nameslist = nameslist.concat(vicestxt, vicenames, knighttxt, knightnames, druidtxt, druidnames, palatxt, palanames, sorctxt, sorcnames);
            levelslist = levelslist.concat(vicessymbol, vicelevels, knightsymbol, knightlevels, druidsymbol, druidlevels, palasymbol, palalevels, sorcsymbol, sorclevels);

            //edit the embed message to include the lists of names and levels 
            if (onlinecount == 0) {
                embedMsg.description = 'There are no watched characters online.';
                embedMsg.fields = null;
            } else {
                embedMsg.description = null;
                embedMsg.fields = [
                    {
                        name: 'Name',
                        value: nameslist,
                        inline: true,
                    },
                    {
                        name: 'Level',
                        value: levelslist,
                        inline: true,
                    },
                ];
            }

            //
            client.channels.fetch(limitlessChannelID)
                .then(channel => {
                    channel.setName(guild + "-" + onlinecount);
                    // channel.send({ embed: embedMsg }); // if first time, otherwise edit msg
                    channel.messages.fetch(onlinemsgID)
                        .then(message => {
                            message.edit({ embed: embedMsg })
                        })
                        .catch(console.error)
                })
                .catch(console.error);

        })
        .catch(function (error) {
            console.error(error);
            client.channels.fetch(limitlessChannelID)
                .then(channel => {
                    channel.setName(guild + "-x");
                    embedMsg.description = 'Error retrieving data.';
                    embedMsg.fields = null;
                    channel.messages.fetch(onlinemsgID)
                        .then(message => message.edit({ embed: embedMsg }))
                        .catch(console.error)
                })
                .catch(console.error);
        });
}

client.once('ready', () => {
    console.log('WatchlistBot is running!');
    setInterval(getMembers, refreshtime * 1000);
})


client.login(process.env.token);