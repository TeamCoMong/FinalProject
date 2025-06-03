package com.app;

import java.util.ArrayList;

public class MenuItem {

    private String name;
    private ArrayList<String> subNameList;

    public MenuItem(String name, ArrayList<String> subNameList) {
        this.name = name;
        this.subNameList = subNameList;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ArrayList<String> getSubNameList() {
        return subNameList;
    }

    public void setSubNameList(ArrayList<String> subNameList) {
        this.subNameList = subNameList;
    }
}
